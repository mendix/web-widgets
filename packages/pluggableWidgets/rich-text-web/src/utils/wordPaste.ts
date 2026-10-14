/**
 * Sanitizer for HTML pasted from Microsoft Word.
 *
 * Word's clipboard HTML carries a large amount of markup that means nothing
 * outside Word: `mso-*` declarations, office-namespace elements, and — most
 * disruptively — list numbers and bullets emitted as literal text inside an
 * `mso-list:Ignore` span rather than as real list structure.
 *
 * This module is a pure `string -> string` transform so it can be tested without
 * an editor instance. `WordPaste` wires it into `transformPastedHTML`.
 *
 * Deliberately NOT done here: reconstructing real `<ol>`/`<ul>` structure. Word
 * emits no list element at all, and `listItem`'s content spec is
 * `paragraph block*`, so a numbered heading cannot live inside a list item — the
 * heading gets ejected and a stranded empty bullet is left behind. Markers are
 * therefore preserved as plain text, which keeps them visible at the cost of
 * live renumbering. See the change design for the full rationale.
 */

/** Width in CSS pixels of one indent level (`margin-left: 2em` at a 16px root). */
const PX_PER_INDENT_LEVEL = 32;

/** Mirrors the widget's `maxIndent`; levels above this are meaningless. */
const MAX_INDENT = 10;

/**
 * Margins below this many pixels are treated as incidental rather than as an
 * indent level, and cannot become the inferred step for a fragment. Half a level.
 */
const MIN_STEP_PX = PX_PER_INDENT_LEVEL / 2;

/** Two margins within this many pixels of each other are the same indent level. */
const CLUSTER_TOLERANCE_PX = 4;

/** Signals that HTML originated from Word. Any one of these is enough. */
const WORD_MARKERS = [
    /mso-[a-z-]+\s*:/i,
    /class=["']?Mso/i,
    /urn:schemas-microsoft-com:office/i,
    /<meta[^>]+(?:ProgId|Generator)[^>]+(?:Word\.Document|Microsoft Word)/i,
    /\[if\s+(?:gte\s+mso|!supportLists)/i
];

/** Word emits bullets as glyphs from these fonts rather than as bullet characters. */
const SYMBOL_BULLETS: Array<{ font: RegExp; text: string; replacement: string }> = [
    { font: /symbol/i, text: "·", replacement: "•" }, // · Symbol      -> • bullet
    { font: /courier/i, text: "o", replacement: "◦" }, // o Courier New -> ◦ white bullet
    { font: /wingdings/i, text: "§", replacement: "▪" } // § Wingdings   -> ▪ small square
];

/** `2.`, `a)`, `iv.`, `12]` — a marker that reads correctly as literal text. */
const ORDERED_MARKER = /^\s*(?:\d+|[A-Za-z]|[ivxlcdmIVXLCDM]+)\s*[.)\]]\s*$/;

const MSO_LIST_LEVEL = /mso-list\s*:[^;"']*?\blevel(\d+)/i;
const MARGIN_LEFT_DECLARATION = /(?:^|;)\s*margin-left\s*:\s*([^;]+)/i;

const CSS_LENGTH = /^\s*(-?\d*\.?\d+)\s*([a-z]*)\s*$/i;
const PX_PER_UNIT: Record<string, number> = {
    px: 1,
    pt: 4 / 3,
    pc: 16,
    in: 96,
    cm: 96 / 2.54,
    mm: 96 / 25.4,
    em: 16,
    rem: 16
};

const BLOCK_SELECTOR = "p, h1, h2, h3, h4, h5, h6, blockquote, div, li";

/**
 * True when the HTML looks like Word output. Everything else is passed through
 * untouched — this transform must never alter a paste from another source.
 */
export function isWordHtml(html: string): boolean {
    return WORD_MARKERS.some(marker => marker.test(html));
}

function cssLengthToPx(value: string): number | null {
    const match = CSS_LENGTH.exec(value);
    if (!match) {
        return null;
    }
    const amount = parseFloat(match[1]);
    if (!Number.isFinite(amount)) {
        return null;
    }
    const unit = match[2].toLowerCase();
    if (!unit) {
        return amount === 0 ? 0 : null;
    }
    const factor = PX_PER_UNIT[unit];
    return factor === undefined ? null : amount * factor;
}

/**
 * Reads `margin-left` from the RAW style attribute rather than `element.style`.
 * CSSOM discards declarations for unknown properties, so touching `element.style`
 * at all risks losing the `mso-*` data we still need to read.
 */
function rawMarginLeftPx(element: Element): number | null {
    const style = element.getAttribute("style");
    if (!style) {
        return null;
    }
    const match = MARGIN_LEFT_DECLARATION.exec(style);
    return match ? cssLengthToPx(match[1].trim()) : null;
}

/**
 * Word's level, straight out of `mso-list:l0 level2 lfo1`. Must be read from the
 * raw attribute: `element.style.getPropertyValue("mso-list")` returns "" because
 * CSSOM drops unknown properties.
 */
function msoListLevel(element: Element): number | null {
    const style = element.getAttribute("style");
    if (!style) {
        return null;
    }
    const match = MSO_LIST_LEVEL.exec(style);
    if (!match) {
        return null;
    }
    const level = parseInt(match[1], 10);
    return Number.isFinite(level) ? Math.min(Math.max(level, 0), MAX_INDENT) : null;
}

/** Removes `mso-*` and `tab-stops` declarations, preserving everything else verbatim. */
function stripMsoDeclarations(style: string): string {
    return style
        .split(";")
        .filter(declaration => {
            const property = declaration.split(":")[0]?.trim().toLowerCase() ?? "";
            return property !== "" && !property.startsWith("mso-") && property !== "tab-stops";
        })
        .map(declaration => declaration.trim())
        .join("; ");
}

/** Replaces an element with its own children. */
function unwrap(element: Element): void {
    const parent = element.parentNode;
    if (!parent) {
        return;
    }
    while (element.firstChild) {
        parent.insertBefore(element.firstChild, element);
    }
    parent.removeChild(element);
}

function toArray<T extends Node>(nodes: ArrayLike<T>): T[] {
    return Array.prototype.slice.call(nodes) as T[];
}

/**
 * Word's tab filler: a tiny-point-size span holding non-breaking spaces, used to
 * pad from the marker to the text. Meaningless once the marker is inline text.
 */
function isTabFiller(element: Element): boolean {
    const style = element.getAttribute("style") ?? "";
    const hasTinyFont = /(?:font|font-size)\s*:[^;]*\b([0-9.]+)pt/i.test(style)
        ? parseFloat(/(?:font|font-size)\s*:[^;]*?([0-9.]+)pt/i.exec(style)![1]) <= 8
        : false;
    return hasTinyFont && (element.textContent ?? "").trim() === "";
}

/** Nearest declared font-family on the element or its ancestors. */
function inheritedFontFamily(element: Element | null): string {
    for (let node = element; node; node = node.parentElement) {
        const style = node.getAttribute?.("style") ?? "";
        const match = /(?:^|;)\s*(?:font-family|font)\s*:\s*([^;]+)/i.exec(style);
        if (match) {
            return match[1];
        }
    }
    return "";
}

/**
 * Turns Word's fake marker into readable text. Ordered markers survive verbatim;
 * symbol-font bullets are substituted, because stripping the font would otherwise
 * leave a literal `o` or `§` in the document.
 */
function normalizeMarkerText(rawText: string, fontFamily: string): string {
    // `\u00a0` written as an escape, not a literal: a raw non-breaking space here
    // is invisible in review and trips the no-irregular-whitespace lint rule.
    const text = rawText.replace(/\u00a0/g, " ").trim();
    if (!text) {
        return "";
    }
    if (ORDERED_MARKER.test(text)) {
        return text;
    }
    const bullet = SYMBOL_BULLETS.find(entry => entry.font.test(fontFamily) && entry.text === text);
    return bullet ? bullet.replacement : text;
}

/**
 * Word wraps the marker span in another span that exists purely to carry the
 * bullet's font (Symbol, Wingdings, Courier New). Once the glyph is substituted
 * for a real character that font must go too, or the replacement is rendered in
 * Symbol and is wrong again. Climbs to the outermost such wrapper.
 */
function outermostMarkerWrapper(marker: Element): Element {
    let outermost = marker;
    for (let parent = marker.parentElement; parent; parent = parent.parentElement) {
        const isFontWrapper = parent.tagName === "SPAN" || parent.tagName === "FONT";
        const wrapsOnlyTheMarker = parent.childNodes.length === 1 && parent.firstChild === outermost;
        if (!isFontWrapper || !wrapsOnlyTheMarker) {
            break;
        }
        outermost = parent;
    }
    return outermost;
}

/**
 * Unwraps every `mso-list:Ignore` marker span, leaving its number or bullet as
 * plain text followed by a single space. Deliberately creates no list structure.
 */
function flattenListMarkers(root: ParentNode): void {
    for (const marker of toArray(root.querySelectorAll('[style*="mso-list:Ignore"]'))) {
        for (const child of toArray(marker.children)) {
            if (isTabFiller(child)) {
                child.remove();
            }
        }

        // Read the font before replacing: the wrapper carrying it is about to go.
        const text = normalizeMarkerText(marker.textContent ?? "", inheritedFontFamily(marker));
        const target = outermostMarkerWrapper(marker);
        const replacement = target.ownerDocument.createTextNode(text ? `${text} ` : "");
        target.parentNode?.replaceChild(replacement, target);
    }
}

/** Drops Word scaffolding that carries no content: conditional comments, `<xml>`, `<style>`. */
function removeWordScaffolding(doc: Document): void {
    const walker = doc.createTreeWalker(doc, 128 /* NodeFilter.SHOW_COMMENT */);
    const comments: Comment[] = [];
    while (walker.nextNode()) {
        comments.push(walker.currentNode as Comment);
    }
    for (const comment of comments) {
        comment.remove();
    }

    for (const element of toArray(doc.querySelectorAll("style, xml, link, meta, title"))) {
        element.remove();
    }

    // Office-namespace elements (`<o:p>`, `<w:sdt>`). Namespaced tags survive
    // HTML parsing as literal element names containing a colon.
    for (const element of toArray(doc.querySelectorAll("*"))) {
        if (element.tagName.includes(":")) {
            element.remove();
        }
    }
}

/** Removes Word-only attributes, unwrapping wrappers left with nothing to say. */
function stripWordAttributes(doc: Document): void {
    for (const element of toArray(doc.querySelectorAll("*"))) {
        const style = element.getAttribute("style");
        if (style !== null) {
            const cleaned = stripMsoDeclarations(style);
            if (cleaned) {
                element.setAttribute("style", cleaned);
            } else {
                element.removeAttribute("style");
            }
        }

        const className = element.getAttribute("class");
        if (className !== null) {
            const kept = className
                .split(/\s+/)
                .filter(name => name && !/^Mso/i.test(name) && name !== "WordSection1")
                .join(" ");
            if (kept) {
                element.setAttribute("class", kept);
            } else {
                element.removeAttribute("class");
            }
        }

        element.removeAttribute("lang");
    }

    // Second pass: a span or font that has lost every attribute is pure noise.
    for (const element of toArray(doc.querySelectorAll("span, font, b[style], div"))) {
        const meaningful = toArray(element.attributes).filter(attribute => attribute.name !== "dir");
        const isUnwrappable = element.tagName === "SPAN" || element.tagName === "FONT" || element.tagName === "DIV";
        if (isUnwrappable && meaningful.length === 0) {
            unwrap(element);
        }
    }
}

/**
 * Assigns each block an indent level and writes it as `data-indent`.
 *
 * Two sources, in priority order:
 *  1. `mso-list:... levelN` — Word states the level outright, so no measurement is
 *     needed and nesting depth stays uniform. Measuring instead would be worse:
 *     Word's 48px step against the widget's 32px step gives 1.5, 3, 4.5, 6 —
 *     irregular level jumps that make nested lists visibly stagger.
 *  2. Otherwise, the fragment's own step, inferred from the set of margins present.
 *     This handles Word content without list metadata, and incidentally any other
 *     source (Google Docs uses the same 36pt step and carries no level data).
 *
 * The source `margin-left` is removed either way, so `data-indent` is the single
 * source of truth and the widget's style mode is irrelevant here.
 */
function applyIndentLevels(doc: Document): void {
    const blocks = toArray(doc.querySelectorAll(BLOCK_SELECTOR));

    const measured = blocks
        .map(element => ({ element, px: rawMarginLeftPx(element) }))
        .filter((entry): entry is { element: Element; px: number } => entry.px !== null && entry.px >= MIN_STEP_PX);

    const step = inferIndentStep(measured.map(entry => entry.px));

    for (const element of blocks) {
        const level = msoListLevel(element);
        if (level !== null) {
            setIndent(element, level);
            continue;
        }

        const px = rawMarginLeftPx(element);
        if (px === null || px < MIN_STEP_PX) {
            removeIndentDeclarations(element);
            continue;
        }

        setIndent(element, Math.round(px / step));
    }
}

/**
 * The smallest indent present in the fragment, taken as one level. Values are
 * clustered first because Word emits jitter (26.1pt beside 26.05pt) that exact
 * arithmetic would treat as distinct steps.
 */
function inferIndentStep(values: number[]): number {
    if (values.length === 0) {
        return PX_PER_INDENT_LEVEL;
    }

    const sorted = [...values].sort((a, b) => a - b);
    const clusters: number[][] = [[sorted[0]]];
    for (const value of sorted.slice(1)) {
        const current = clusters[clusters.length - 1];
        if (value - current[current.length - 1] <= CLUSTER_TOLERANCE_PX) {
            current.push(value);
        } else {
            clusters.push([value]);
        }
    }

    const smallest = clusters[0];
    return smallest.reduce((sum, value) => sum + value, 0) / smallest.length;
}

function setIndent(element: Element, level: number): void {
    removeIndentDeclarations(element);
    const clamped = Math.min(Math.max(level, 0), MAX_INDENT);
    if (clamped > 0) {
        element.setAttribute("data-indent", String(clamped));
    }
}

/**
 * Drops `margin-left` (now represented by `data-indent`) and `text-indent`.
 *
 * `text-indent` goes too because Word's is almost always the negative half of a
 * hanging indent, whose only job is to pull the list marker out to a tab stop.
 * Flattening the marker to inline text dismantles that mechanism, so a surviving
 * `text-indent:-18pt` would just drag the first line of real text backwards.
 * Tiptap parses no `text-indent` attribute either way, so nothing is lost.
 */
function removeIndentDeclarations(element: Element): void {
    const style = element.getAttribute("style");
    if (!style) {
        return;
    }
    const kept = style
        .split(";")
        .filter(declaration => {
            const property = declaration.split(":")[0]?.trim().toLowerCase() ?? "";
            return property !== "" && property !== "margin-left" && property !== "text-indent";
        })
        .map(declaration => declaration.trim())
        .join("; ");
    if (kept) {
        element.setAttribute("style", kept);
    } else {
        element.removeAttribute("style");
    }
}

/**
 * Sanitizes Word clipboard HTML. Non-Word input is returned unchanged, and the
 * output contains no Word markers, so applying this twice is a no-op.
 */
export function sanitizeWordHtml(html: string): string {
    if (!isWordHtml(html)) {
        return html;
    }

    const doc = new DOMParser().parseFromString(html, "text/html");

    // Markers first: they live inside spans that later passes would unwrap, and
    // the font-family they depend on is stripped by `stripWordAttributes`.
    flattenListMarkers(doc);
    applyIndentLevels(doc);
    removeWordScaffolding(doc);
    stripWordAttributes(doc);

    return doc.body.innerHTML;
}
