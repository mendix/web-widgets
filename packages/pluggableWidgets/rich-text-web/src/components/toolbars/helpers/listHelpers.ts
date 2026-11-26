export type OrderedListStyle = "decimal" | "lower-alpha" | "lower-roman";

export const STYLE_ICON_MAP: Record<OrderedListStyle, string> = {
    decimal: "List-numbers",
    "lower-alpha": "List-lower-alpha",
    "lower-roman": "List-roman"
};

export function getIconForOrderedListStyle(style: OrderedListStyle | null | undefined): string {
    if (!style || style === "decimal") {
        return STYLE_ICON_MAP.decimal;
    }
    return STYLE_ICON_MAP[style];
}

/**
 * Turn the text typed in the start number input into the value to store. Empty input resets the
 * list to 1. Zero, negative and non-integer input is rejected by returning `current`, so the
 * input reverts. Values above `max` are clamped.
 */
export function normalizeStartInput(raw: string, current: number, max: number): number {
    const trimmed = raw.trim();
    if (trimmed === "") {
        return 1;
    }
    if (!/^\d+$/.test(trimmed)) {
        return current;
    }
    const value = Number(trimmed);
    if (value < 1) {
        return current;
    }
    return Math.min(value, max);
}
