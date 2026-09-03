/**
 * Conversions between an image node's stored `width`/`height` and the two forms
 * it has to take: a CSS length for the node view, and a `width`/`height` HTML
 * attribute value for serialized content.
 *
 * The stored value is not one shape. Rich Text 4 wrote bare numbers as HTML
 * attributes (`width="300"`), version 5 writes pixel strings (`"300px"`), and
 * pasted HTML can carry any CSS length or a percentage. Parsing deliberately
 * keeps whatever it found, so both conversions below have to cope with all of
 * them.
 */

const UNITLESS = /^\d+(\.\d+)?$/;
const PIXELS = /^(\d+(\.\d+)?)px$/i;
const PERCENTAGE = /^\d+(\.\d+)?%$/;

function normalize(value: string | number | null | undefined): string | undefined {
    if (value === null || value === undefined) {
        return undefined;
    }
    const str = String(value).trim();
    return str === "" ? undefined : str;
}

/**
 * Stored dimension as a CSS length. A bare number is pixels — that is what
 * version 4 stored, and `width: 300` on its own is invalid CSS, so without this
 * the browser drops the declaration and the image falls back to its natural size.
 */
export function toCssLength(value: string | number | null | undefined): string | undefined {
    const str = normalize(value);
    if (str === undefined) {
        return undefined;
    }
    return UNITLESS.test(str) ? `${str}px` : str;
}

/**
 * Stored dimension as a `width`/`height` attribute value. The attribute is
 * defined as a non-negative integer, so the `px` suffix is dropped; percentages
 * are kept because browsers accept them here and dropping one would resize the
 * image. Anything else (`20em`, `auto`) returns undefined so the attribute is
 * omitted: legacy dimension parsing would read `20em` as 20 pixels and silently
 * shrink the image.
 */
export function toHtmlDimension(value: string | number | null | undefined): string | undefined {
    const str = normalize(value);
    if (str === undefined) {
        return undefined;
    }
    if (UNITLESS.test(str) || PERCENTAGE.test(str)) {
        return str;
    }
    const pixels = PIXELS.exec(str);
    return pixels ? pixels[1] : undefined;
}
