import { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { isSafeCssColor, isSafeCssFontFamily, isSafeCssSize, normalizeCssSize } from "./helpers";

/**
 * Formatting a list marker inherits from the first inline run of its list item.
 *
 * `::marker` inherits from its `<li>`, but every format the user can apply lands on an
 * inline mark two levels down (`<li> > <p> > <span>`), and CSS has no child-to-ancestor
 * selector. So the format has to be lifted onto the `<li>` by JavaScript.
 *
 * Word and Google Docs both take the format of the item's *first text run*, which also
 * gives a well-defined answer when the user formats only part of the item. Since partial
 * selection splits the text into separate marked runs, "read the first inline child"
 * expresses that rule directly:
 *
 *   select all "Hello"  ->  <span 32px>Hello</span>   marker 32px
 *   select only "H"     ->  <span 32px>H</span>ello   marker 32px
 *   select only "llo"   ->  He<span 32px>llo</span>   marker unchanged
 */
export interface MarkerFormat {
    fontSize?: string;
    color?: string;
    fontFamily?: string;
    bold?: true;
    italic?: true;
}

/** Only px sizes participate in gutter math; see `parsePxSize`. */
const PX_SIZE = /^(\d+(?:\.\d+)?)px$/;

/** Class-mode `attr()` consumers take the bare number, matching `has-font-size`. */
const LEADING_NUMBER = /^(\d+(?:\.\d+)?)/;

/**
 * Read the marker format from a `listItem` node.
 *
 * `listItem`'s content expression is `paragraph block*`, so the first child is always a
 * paragraph and "the first inline run" is unambiguous. Returns `null` when the first run
 * carries none of the relevant marks, so an unformatted item emits no attributes at all
 * and renders byte-identically to before this feature existed.
 */
export function computeMarkerFormat(node: ProseMirrorNode): MarkerFormat | null {
    // Non-text leading nodes (images, hard breaks) have an empty mark set, so they fall
    // through to `null` without special-casing.
    const marks = node.firstChild?.firstChild?.marks;
    if (!marks?.length) {
        return null;
    }

    const format: MarkerFormat = {};

    // `textStyle` is the single mark behind FontSize, TextColorClass and FontFamilyClass.
    const textStyle = marks.find(mark => mark.type.name === "textStyle");
    if (textStyle) {
        // The colour attribute is `textColor`, registered by TextColorClass — not the
        // `color` attribute of @tiptap/extension-color, which this widget does not load.
        const { fontSize, textColor, fontFamily } = textStyle.attrs;

        const normalizedSize = typeof fontSize === "string" ? normalizeCssSize(fontSize) : null;
        if (normalizedSize && isSafeCssSize(normalizedSize)) {
            format.fontSize = normalizedSize;
        }
        if (typeof textColor === "string" && isSafeCssColor(textColor)) {
            format.color = textColor;
        }
        // `fontFamily` always holds the CSS value in both style modes; `fontValue` is only
        // the kebab-case identifier the toolbar dropdown matches on, so it is not used here.
        if (typeof fontFamily === "string" && isSafeCssFontFamily(fontFamily)) {
            format.fontFamily = fontFamily;
        }
    }

    // Bold and italic are their own marks, not `textStyle` attributes.
    if (marks.some(mark => mark.type.name === "bold")) {
        format.bold = true;
    }
    if (marks.some(mark => mark.type.name === "italic")) {
        format.italic = true;
    }

    return Object.keys(format).length > 0 ? format : null;
}

/**
 * Largest first-run font size among a list's *direct* items, as a px string.
 *
 * Drives the marker gutter: an enlarged marker grows leftward out of the list's
 * `padding-left`, so the padding has to grow with it. Returns `null` when no item has a
 * px font size, leaving the gutter at its existing value.
 *
 * Non-px units are skipped rather than converted — they are not comparable without a
 * layout context, and every size the toolbar offers is px.
 */
export function computeMaxMarkerSize(listNode: ProseMirrorNode): string | null {
    let max = 0;

    listNode.forEach(child => {
        const size = parsePxSize(computeMarkerFormat(child)?.fontSize);
        if (size > max) {
            max = size;
        }
    });

    return max > 0 ? `${max}px` : null;
}

function parsePxSize(value: string | undefined): number {
    const match = value ? PX_SIZE.exec(value) : null;
    return match ? parseFloat(match[1]) : 0;
}

/** Roman numerals, descending, for `romanLength`. */
const ROMAN_NUMERALS: Array<[number, string]> = [
    [1000, "m"],
    [900, "cm"],
    [500, "d"],
    [400, "cd"],
    [100, "c"],
    [90, "xc"],
    [50, "l"],
    [40, "xl"],
    [10, "x"],
    [9, "ix"],
    [5, "v"],
    [4, "iv"],
    [1, "i"]
];

/**
 * Character count of the longest marker the list will render, excluding the trailing `.`.
 *
 * The gutter must fit the *longest* marker, not a typical one: markers are laid out to the
 * left of the item text, so `998.` needs roughly twice the room `9.` does. Measured in
 * Chrome at 98px, a 1.5x-of-font-size gutter fits one and two digits but clips three, which
 * is why this is counted rather than assumed.
 *
 * Returns 1 for bullet lists, whose marker is a single glyph.
 */
export function computeMarkerLength(listNode: ProseMirrorNode): number {
    if (listNode.type.name !== "orderedList") {
        return 1;
    }

    // The last item carries the highest counter, so it is the widest.
    const start = typeof listNode.attrs.start === "number" ? listNode.attrs.start : 1;
    const highest = Math.max(start + listNode.childCount - 1, 1);

    switch (resolveCounterStyle(listNode.attrs)) {
        case "lower-alpha":
            return alphaLength(highest);
        case "lower-roman":
            return romanLength(highest);
        default:
            return String(highest).length;
    }
}

/**
 * The counter style, from the widget's own `listStyleType` attribute or, failing that, the
 * HTML `type` attribute that `OrderedList` parses.
 */
function resolveCounterStyle(attrs: Record<string, unknown>): string {
    if (typeof attrs.listStyleType === "string") {
        return attrs.listStyleType;
    }

    switch (attrs.type) {
        case "a":
        case "A":
            return "lower-alpha";
        case "i":
        case "I":
            return "lower-roman";
        default:
            return "decimal";
    }
}

/** `a`..`z`, then `aa`..`zz`: base-26 with no zero digit, so 26 is still one character. */
function alphaLength(highest: number): number {
    let length = 0;
    let remaining = highest;

    while (remaining > 0) {
        remaining = Math.ceil(remaining / 26) - 1;
        length++;
    }

    return length;
}

function romanLength(highest: number): number {
    let length = 0;
    let remaining = highest;

    for (const [value, numeral] of ROMAN_NUMERALS) {
        while (remaining >= value) {
            remaining -= value;
            length += numeral.length;
        }
    }

    return length;
}

/**
 * Inline-mode attributes: custom properties consumed by the `li::marker` rule.
 *
 * Custom properties are used rather than real font properties because real ones would
 * cascade into the item's own content, which would need a `li > p` reset — and CSS cannot
 * express "inherit from grandparent". Faking the base size would mean baking a
 * theme-dependent pixel value into stored content. See design.md, Decision 3.
 */
export function markerFormatToInlineStyle(format: MarkerFormat): string {
    const declarations: string[] = [];

    if (format.fontSize) {
        declarations.push(`--rt-marker-font-size: ${format.fontSize}`);
    }
    if (format.color) {
        declarations.push(`--rt-marker-color: ${format.color}`);
    }
    if (format.fontFamily) {
        declarations.push(`--rt-marker-font-family: ${format.fontFamily}`);
    }
    if (format.bold) {
        declarations.push("--rt-marker-font-weight: bold");
    }
    if (format.italic) {
        declarations.push("--rt-marker-font-style: italic");
    }

    return declarations.join("; ");
}

/**
 * Class-mode attributes: one class per property, mirroring `has-font-size` /
 * `has-text-color` / `has-font-family`.
 *
 * Per-property classes rather than one combined class so each `attr()` rule only applies
 * where its attribute actually exists — a combined class would leave `attr()` referencing
 * a missing attribute whenever the user set only some of the five properties.
 */
export function markerFormatToClassAttrs(format: MarkerFormat): Record<string, string> {
    const classes: string[] = [];
    const attrs: Record<string, string> = {};

    if (format.fontSize) {
        // Bare number, matching what `attr(data-marker-font-size px)` expects.
        const match = LEADING_NUMBER.exec(format.fontSize);
        if (match) {
            classes.push("has-marker-font-size");
            attrs["data-marker-font-size"] = match[1];
        }
    }
    if (format.color) {
        classes.push("has-marker-color");
        attrs["data-marker-color"] = format.color;
    }
    if (format.fontFamily) {
        classes.push("has-marker-font-family");
        attrs["data-marker-font-family"] = format.fontFamily;
    }
    if (format.bold) {
        classes.push("has-marker-bold");
    }
    if (format.italic) {
        classes.push("has-marker-italic");
    }

    if (classes.length > 0) {
        attrs.class = classes.join(" ");
    }

    return attrs;
}

/** Marker attributes for a `listItem`, in whichever shape the widget is configured for. */
export function markerFormatToAttrs(
    format: MarkerFormat | null,
    styleDataFormat: "inline" | "class"
): Record<string, string> {
    if (!format) {
        return {};
    }

    if (styleDataFormat === "class") {
        return markerFormatToClassAttrs(format);
    }

    const style = markerFormatToInlineStyle(format);
    return style ? { style } : {};
}

/**
 * Gutter attributes for an `orderedList`/`bulletList`, in the configured shape.
 *
 * `markerLength` is only emitted above 1, so a bullet list or a short numbered list keeps
 * the markup it had before this feature and falls back to the stylesheet's default of 1.
 */
export function maxMarkerSizeToAttrs(
    maxSize: string | null,
    styleDataFormat: "inline" | "class",
    markerLength = 1
): Record<string, string> {
    if (!maxSize) {
        return {};
    }

    if (styleDataFormat === "class") {
        const match = LEADING_NUMBER.exec(maxSize);
        if (!match) {
            return {};
        }

        const classes = ["has-marker-gutter"];
        const attrs: Record<string, string> = { "data-marker-max-size": match[1] };
        if (markerLength > 1) {
            classes.push("has-marker-chars");
            attrs["data-marker-chars"] = String(markerLength);
        }

        return { ...attrs, class: classes.join(" ") };
    }

    const declarations = [`--rt-marker-max-size: ${maxSize}`];
    if (markerLength > 1) {
        declarations.push(`--rt-marker-chars: ${markerLength}`);
    }

    return { style: declarations.join("; ") };
}
