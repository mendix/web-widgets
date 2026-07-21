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
