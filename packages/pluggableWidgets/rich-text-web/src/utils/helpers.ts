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
