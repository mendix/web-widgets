import { CSSProperties } from "react";
import { RichTextContainerProps } from "typings/RichTextProps";

export const INDENT_MAGIC_NUMBER = 3;
export const ACTION_DISPATCHER = "ACTION_DISPATCHER";

// Characters/sequences that could break out of a CSS declaration or smuggle in a URL/expression.
const CSS_COLOR_UNSAFE = /[{}<>;@]|url\(|expression\(|\/\*|\\/i;
// Fallback allowlist for environments without CSS.supports (e.g. jsdom): hex, rgb(a), hsl(a).
const CSS_COLOR_ALLOWLIST = /^#[0-9a-f]{3,8}$|^rgba?\(\s*[\d.%,\s/]+\)$|^hsla?\(\s*[\d.%,\s/deg]+\)$/i;

/**
 * Guards against CSS injection when a color string is interpolated into a
 * dynamically generated <style> element. Returns true only for values that are
 * safe to use as a CSS color value.
 */
export function isSafeCssColor(value: string): boolean {
    const color = value.trim();
    if (!color || CSS_COLOR_UNSAFE.test(color)) {
        return false;
    }
    if (typeof CSS !== "undefined" && typeof CSS.supports === "function") {
        return CSS.supports("color", color);
    }
    return CSS_COLOR_ALLOWLIST.test(color);
}

// Fallback allowlist for CSS size values without CSS.supports: number + unit (px, %, em, rem, vw, vh, ch),
// bare number (treated as px), or the keyword "auto".
const CSS_SIZE_ALLOWLIST = /^(auto|\d+(\.\d+)?(px|%|em|rem|vw|vh|ch)?)$/i;

// Allowed CSS border-style keywords.
const CSS_BORDER_STYLE_ALLOWLIST = new Set([
    "none",
    "hidden",
    "solid",
    "dashed",
    "dotted",
    "double",
    "groove",
    "ridge",
    "inset",
    "outset"
]);

// Allowed text-align keywords.
const CSS_TEXT_ALIGN_ALLOWLIST = new Set(["left", "center", "right", "justify", "start", "end"]);

// Link protocols considered safe to render as an href. Relative/anchor URLs (no
// scheme) are always allowed; everything with a scheme must be on this list.
const SAFE_URL_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

/**
 * Guards against a CSS border-style value being used to smuggle extra
 * declarations into a concatenated style string. Returns true only for known
 * border-style keywords.
 */
export function isSafeCssBorderStyle(value: string): boolean {
    return CSS_BORDER_STYLE_ALLOWLIST.has(value.trim().toLowerCase());
}

/**
 * Guards against a text-align value injecting extra CSS. Returns true only for
 * known alignment keywords.
 */
export function isSafeCssTextAlign(value: string): boolean {
    return CSS_TEXT_ALIGN_ALLOWLIST.has(value.trim().toLowerCase());
}

/**
 * Guards a font-family value before it is interpolated into a style string.
 * Reuses the CSS-injection char blocklist (blocks `;{}<>@`, url(, expression(,
 * comments and backslash escapes) which are never valid in a font-family value.
 */
export function isSafeCssFontFamily(value: string): boolean {
    const font = value.trim();
    return !!font && !CSS_COLOR_UNSAFE.test(font);
}

// Removes ASCII control chars and spaces (U+0000–U+0020) that browsers ignore
// when resolving a URL's scheme (e.g. "java\tscript:" → "javascript:").
function stripLowControlChars(value: string): string {
    let result = "";
    for (const ch of value) {
        if (ch.charCodeAt(0) > 0x20) {
            result += ch;
        }
    }
    return result;
}

/**
 * Guards a link href against dangerous schemes (javascript:, data:, vbscript:, …).
 * Relative URLs and fragments (no scheme) are allowed; any explicit scheme must
 * be in SAFE_URL_PROTOCOLS. Tabs/newlines/control chars are stripped before
 * scheme detection because browsers strip them before resolving the protocol.
 */
export function isSafeLinkUrl(value: string): boolean {
    const url = value.trim();
    if (!url) {
        return false;
    }
    // Strip control chars + whitespace (U+0000–U+0020) so `java\tscript:` can't slip past.
    const forSchemeCheck = stripLowControlChars(url);
    const schemeMatch = forSchemeCheck.match(/^([a-z][a-z0-9+.-]*):/i);
    if (schemeMatch) {
        return SAFE_URL_PROTOCOLS.has(`${schemeMatch[1].toLowerCase()}:`);
    }
    // No scheme → relative URL / anchor / fragment.
    return true;
}

/**
 * Guards against CSS injection when a size string (e.g. "250px", "100%") is
 * interpolated into an inline style. Returns true only for safe CSS length/percentage values.
 */
export function isSafeCssSize(value: string): boolean {
    const size = value.trim();
    if (!size || CSS_COLOR_UNSAFE.test(size)) {
        return false;
    }
    if (typeof CSS !== "undefined" && typeof CSS.supports === "function") {
        return CSS.supports("width", size);
    }
    return CSS_SIZE_ALLOWLIST.test(size);
}

// Normalizes a size input to a CSS value: bare numbers become "<n>px", other valid units pass through.
// Returns null for empty/invalid input.
export function normalizeCssSize(value: string): string | null {
    const size = value.trim();
    if (!size) {
        return null;
    }
    // Bare number → px
    const normalized = /^\d+(\.\d+)?$/.test(size) ? `${size}px` : size;
    return isSafeCssSize(normalized) ? normalized : null;
}

function getHeightScale(height: number, heightUnit: "pixels" | "percentageOfParent" | "percentageOfView"): string {
    return `${height}${heightUnit === "pixels" ? "px" : heightUnit === "percentageOfView" ? "vh" : "%"}`;
}

export function constructWrapperStyle(props: RichTextContainerProps): CSSProperties {
    const { widthUnit, heightUnit, minHeightUnit, maxHeightUnit, width, height, minHeight, maxHeight, OverflowY } =
        props;

    const wrapperStyle: Pick<CSSProperties, "width" | "height" | "minHeight" | "maxHeight" | "maxWidth" | "overflowY"> =
        {};

    wrapperStyle.width = `${width}${widthUnit === "pixels" ? "px" : "%"}`;
    if (heightUnit === "percentageOfWidth") {
        wrapperStyle.height = "auto";

        if (minHeightUnit !== "none") {
            wrapperStyle.minHeight = getHeightScale(minHeight, minHeightUnit);
        }

        if (maxHeightUnit !== "none") {
            wrapperStyle.maxHeight = getHeightScale(maxHeight, maxHeightUnit);
            wrapperStyle.overflowY = OverflowY;
        }
    } else {
        wrapperStyle.height = getHeightScale(height, heightUnit);
    }

    return wrapperStyle;
}

export function normalizeStyleAndClassAttribute(doc: Document, styleDataFormat: "inline" | "class"): void {
    if (styleDataFormat === "class") {
        const allIndentLeftElements = doc.querySelectorAll("[style*=padding-left]");
        const allIndentRightElements = doc.querySelectorAll("[style*=padding-right]");
        allIndentLeftElements.forEach(element => {
            const paddingLeft = (element as HTMLElement).style.paddingLeft || "0em";
            const indentValue = parseInt(paddingLeft.replace("px", "").replace("em", ""), 10);
            if (indentValue) {
                const indentClassValue = Math.round(indentValue / INDENT_MAGIC_NUMBER);
                element.classList.add(`ql-indent-${indentClassValue}`);
                (element as HTMLElement).style.removeProperty("padding-left");
            }
        });
        allIndentRightElements.forEach(element => {
            const paddingRight = (element as HTMLElement).style.paddingRight || "0em";
            const indentValue = parseInt(paddingRight.replace("px", "").replace("em", ""), 10);
            if (indentValue) {
                const indentClassValue = Math.round(indentValue / INDENT_MAGIC_NUMBER);
                element.classList.add(`ql-indent-${indentClassValue}`);
                (element as HTMLElement).style.removeProperty("padding-right");
            }
        });
    } else if (styleDataFormat === "inline") {
        const allIndentsElements = doc.querySelectorAll("[class*=ql-indent-]");
        allIndentsElements.forEach(element => {
            const indentClass = Array.from(element.classList).find(className => className.startsWith("ql-indent-"));
            if (indentClass) {
                const indentValue = parseInt(indentClass.replace("ql-indent-", ""), 10);
                if (indentValue) {
                    if (element.classList.contains("ql-direction-rtl")) {
                        (element as HTMLElement).style.paddingRight = `${indentValue * INDENT_MAGIC_NUMBER}em`;
                    } else {
                        (element as HTMLElement).style.paddingLeft = `${indentValue * INDENT_MAGIC_NUMBER}em`;
                    }
                }
                element.classList.remove(indentClass);
            }
        });
    }
}
