import { mergeAttributes } from "@tiptap/core";
import { DOMOutputSpec, Node as ProseMirrorNode } from "@tiptap/pm/model";
import { isSafeCssBorderStyle } from "../utils/helpers";
import { buildBorderStyleSegments, safeColor, safeSize } from "../utils/tableStyle";

// Declare the shared cell-styling commands once. Both the data cell (<td>) and
// header cell (<th>) extensions register these via `sharedCellBorderCommands`.
declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        tableCellStyling: {
            setCellBorderColor: (borderColor: string) => ReturnType;
            setCellBorderStyle: (borderStyle: string) => ReturnType;
            setCellBorderWidth: (borderWidth: string) => ReturnType;
        };
    }
}

export type CellStyleDataFormat = "inline" | "class";

export interface CellStylingOptions {
    styleDataFormat: CellStyleDataFormat;
}

/**
 * Shared attribute definitions for stylable table cells (both `<td>` and `<th>`).
 * Covers column width, cell height, background color, and border color/style/width.
 *
 * Every attribute's `renderHTML` returns `{}` — the inline `style` string and the
 * class-mode `data-*` attributes are emitted centrally by {@link renderCellHTML}
 * (with validation), so returning `{}` here avoids unvalidated, duplicate emission
 * that `mergeAttributes` would otherwise fold in.
 */
export function buildCellStylingAttributes(styleDataFormat: CellStyleDataFormat): Record<string, any> {
    return {
        // Column width stored as a CSS size string (e.g. "250px", "50%") applied to the cell's
        // inline style — replaces the numeric `colwidth` array for our configuration UI.
        cellWidth: {
            default: null,
            parseHTML: (element: HTMLElement) => {
                if (styleDataFormat === "class") {
                    return element.getAttribute("data-cell-width") || element.style.width || null;
                } else {
                    return element.style.width || null;
                }
            },
            renderHTML: () => {
                return {};
            }
        },
        // Cell height stored as a CSS size string (e.g. "100px", "50%") applied to the cell's
        // inline style. Behaves as a minimum height (content still grows the cell/row).
        cellHeight: {
            default: null,
            parseHTML: (element: HTMLElement) => {
                if (styleDataFormat === "class") {
                    return element.getAttribute("data-cell-height") || element.style.height || null;
                } else {
                    return element.style.height || null;
                }
            },
            renderHTML: () => {
                return {};
            }
        },
        backgroundColor: {
            default: null,
            parseHTML: (element: HTMLElement) => {
                if (styleDataFormat === "class") {
                    return element.getAttribute("data-background-color") || null;
                } else {
                    return element.style.backgroundColor || null;
                }
            },
            renderHTML: () => {
                return {};
            }
        },
        // Cell border color attribute - stores custom border color for individual cells
        borderColor: {
            default: null,
            parseHTML: (element: HTMLElement) => {
                if (styleDataFormat === "class") {
                    return element.getAttribute("data-border-color") || null;
                } else {
                    return element.style.borderColor || null;
                }
            },
            renderHTML: () => {
                return {};
            }
        },
        // Cell border style attribute - supports CSS border-style values
        borderStyle: {
            default: null,
            parseHTML: (element: HTMLElement) => {
                if (styleDataFormat === "class") {
                    return element.getAttribute("data-border-style") || null;
                } else {
                    return element.style.borderStyle || null;
                }
            },
            renderHTML: () => {
                return {};
            }
        },
        // Cell border width attribute - stores border width in pixels
        borderWidth: {
            default: null,
            parseHTML: (element: HTMLElement) => {
                if (styleDataFormat === "class") {
                    return element.getAttribute("data-border-width") || null;
                } else {
                    return element.style.borderWidth || null;
                }
            },
            renderHTML: () => {
                return {};
            }
        }
    };
}

/**
 * Central, validated renderer for a stylable table cell. Builds the inline `style`
 * string (inline format) or the `data-*` attributes and helper classes (class
 * format) shared by the `<td>` and `<th>` extensions. The only per-extension
 * difference is the emitted `tag`.
 */
export function renderCellHTML(
    tag: "td" | "th",
    node: ProseMirrorNode,
    HTMLAttributes: Record<string, any>,
    styleDataFormat: CellStyleDataFormat
): DOMOutputSpec {
    // Read raw node attrs — the attribute renderHTML return {} (to avoid double
    // emission), so they are NOT present on HTMLAttributes. All values are
    // validated before entering the style string (see tableStyle.ts).
    const cellWidth = safeSize(node.attrs.cellWidth);
    const cellHeight = safeSize(node.attrs.cellHeight);
    const backgroundColor = safeColor(node.attrs.backgroundColor);
    const borderColor = safeColor(node.attrs.borderColor);

    const classAttrs: Record<string, any> = {};
    const segments: string[] = [];

    // Column width applies in both formats (always an inline width on the cell)
    if (cellWidth) {
        segments.push(`width: ${cellWidth}`);
    }

    // Cell height (minimum) applies in both formats
    if (cellHeight) {
        segments.push(`height: ${cellHeight}`);
    }

    // Inline mode: build style string with border defaults
    if (styleDataFormat === "inline") {
        // Background color
        if (backgroundColor) {
            segments.push(`background-color: ${backgroundColor}`);
        }

        // Border properties with defaults (validated)
        segments.push(
            ...buildBorderStyleSegments(node.attrs.borderColor, node.attrs.borderStyle, node.attrs.borderWidth)
        );
    }

    const styleString = segments.join("; ");

    // Class mode: use data attributes
    if (styleDataFormat === "class") {
        if (cellWidth) {
            classAttrs["data-cell-width"] = cellWidth;
        }
        if (cellHeight) {
            classAttrs["data-cell-height"] = cellHeight;
        }
        if (backgroundColor) {
            classAttrs["data-background-color"] = backgroundColor;
            classAttrs.class = "has-background-color";
        }
        const borderStyle =
            node.attrs.borderStyle && isSafeCssBorderStyle(node.attrs.borderStyle) ? node.attrs.borderStyle : null;
        const borderWidth = safeSize(node.attrs.borderWidth);
        if (borderColor || borderStyle || borderWidth) {
            if (borderColor) classAttrs["data-border-color"] = borderColor;
            if (borderStyle) classAttrs["data-border-style"] = borderStyle;
            if (borderWidth) classAttrs["data-border-width"] = borderWidth;
            classAttrs.class = classAttrs.class ? `${classAttrs.class} has-cell-border` : "has-cell-border";
        }
    }

    const attrs = mergeAttributes(
        HTMLAttributes,
        styleString ? { style: styleString } : {},
        styleDataFormat === "class" ? classAttrs : {}
    );

    return [tag, attrs, 0];
}

/**
 * Shared border commands used by both the data cell and header cell extensions.
 * Each command sets the corresponding attribute on the currently selected cell.
 */
export function sharedCellBorderCommands(): Record<string, any> {
    return {
        setCellBorderColor:
            (borderColor: string) =>
            ({ commands }: { commands: any }) => {
                return commands.setCellAttribute("borderColor", borderColor);
            },
        setCellBorderStyle:
            (borderStyle: string) =>
            ({ commands }: { commands: any }) => {
                return commands.setCellAttribute("borderStyle", borderStyle);
            },
        setCellBorderWidth:
            (borderWidth: string) =>
            ({ commands }: { commands: any }) => {
                return commands.setCellAttribute("borderWidth", borderWidth);
            }
    };
}
