import { isSafeCssBorderStyle, isSafeCssColor, isSafeCssSize } from "./helpers";

/**
 * Shared, injection-safe builders for the concatenated inline `style` strings
 * that the table/cell extensions emit. Table and cell attributes are stored in
 * the document and round-trip through pasted HTML, so every value is validated
 * against the same allowlists used elsewhere before it reaches a style string
 * (or `cssText`, which parses a full declaration block and would otherwise let a
 * crafted value smuggle in extra properties).
 */

// Returns the color only if it is a safe CSS color, else null.
export function safeColor(value: unknown): string | null {
    return typeof value === "string" && isSafeCssColor(value) ? value : null;
}

// Returns the size only if it is a safe CSS length/percentage, else null.
export function safeSize(value: unknown): string | null {
    return typeof value === "string" && isSafeCssSize(value) ? value : null;
}

// Returns the border-style keyword only if it is on the allowlist, else null.
function safeBorderStyle(value: unknown): string | null {
    return typeof value === "string" && isSafeCssBorderStyle(value) ? value : null;
}

/**
 * Builds the validated `border-style`/`border-width`/`border-color` segments for
 * a table or cell. Returns an empty array when no border property is set, so the
 * caller can skip emitting a border entirely. Defaults border-style to "solid"
 * and border-width to "1px" (matching the previous behavior) when only a color is
 * provided. Any value that fails validation is dropped rather than emitted.
 */
export function buildBorderStyleSegments(borderColor: unknown, borderStyle: unknown, borderWidth: unknown): string[] {
    const color = safeColor(borderColor);
    const style = safeBorderStyle(borderStyle);
    const width = safeSize(borderWidth);

    // Nothing (safe) to render.
    if (!color && !style && !width) {
        return [];
    }

    const segments: string[] = [];
    segments.push(`border-style: ${style || "solid"}`);
    segments.push(`border-width: ${width || "1px"}`);
    if (color) {
        segments.push(`border-color: ${color}`);
    }
    return segments;
}

// Joins non-empty style segments into a single declaration string.
export function joinStyleSegments(segments: string[]): string {
    return segments.filter(Boolean).join("; ");
}
