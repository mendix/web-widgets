import { mergeAttributes } from "@tiptap/core";
import { Table } from "@tiptap/extension-table";
import { DOMOutputSpec, Node as ProseMirrorNode } from "@tiptap/pm/model";
import { EditorView, NodeView } from "@tiptap/pm/view";
import { isSafeCssBorderStyle } from "../utils/helpers";
import { buildBorderStyleSegments, safeColor, safeSize } from "../utils/tableStyle";

// Declare custom commands for table border styling
declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        tableBackgroundColor: {
            setTableBorderStyle: (borderStyle: string) => ReturnType;
            setTableBorderWidth: (borderWidth: string) => ReturnType;
            setTableWidth: (width: string | null) => ReturnType;
            setTableMinHeight: (minHeight: string | null) => ReturnType;
        };
    }
}

// Helper to create colgroup (copied from TipTap source)
function createColGroup(
    node: any,
    cellMinWidth: number
): { colgroup: any[]; tableWidth: string; tableMinWidth: string } {
    let totalWidth = 0;
    let fixedWidth = true;
    const cols: any[] = [];
    const row = node.firstChild;

    if (!row) {
        return { colgroup: ["colgroup"], tableWidth: "", tableMinWidth: "" };
    }

    for (let i = 0, col = 0; i < row.childCount; i += 1) {
        const { colspan, colwidth, cellWidth } = row.child(i).attrs;
        for (let j = 0; j < colspan; j += 1, col += 1) {
            // Prefer our CSS-string cellWidth (e.g. "250px", "50%"); fall back to TipTap's numeric colwidth.
            // Under table-layout:fixed the <col> width governs the column, so the width must live here.
            const stringWidth = j === 0 && typeof cellWidth === "string" && cellWidth ? cellWidth : "";
            const numericWidth = colwidth && colwidth[j] ? colwidth[j] + "px" : "";
            const cssWidth = stringWidth || numericWidth;

            // Percentage widths can't contribute to a fixed pixel total
            const isPercent = cssWidth.endsWith("%");
            if (cssWidth && !isPercent) {
                totalWidth += stringWidth ? parseInt(stringWidth, 10) || cellMinWidth : colwidth[j];
            } else {
                totalWidth += cellMinWidth;
                fixedWidth = false;
            }

            const safeCssWidth = safeSize(cssWidth);
            cols.push(["col", safeCssWidth ? { style: `width: ${safeCssWidth}` } : {}]);
        }
    }

    const tableWidth = fixedWidth ? totalWidth + "px" : "";
    const tableMinWidth = fixedWidth ? "" : totalWidth + "px";

    return {
        colgroup: ["colgroup", {}, ...cols],
        tableWidth,
        tableMinWidth
    };
}

export type TableBackgroundColorOptions = {
    HTMLAttributes?: Record<string, any>;
    resizable?: boolean;
    cellMinWidth?: number;
    renderWrapper?: boolean;
    styleDataFormat: "inline" | "class";
};

export const TableBackgroundColor = Table.extend<TableBackgroundColorOptions>({
    addOptions() {
        return {
            ...this.parent?.(),
            HTMLAttributes: {},
            resizable: true,
            cellMinWidth: 25,
            renderWrapper: false,
            styleDataFormat: "inline"
        };
    },

    addKeyboardShortcuts() {
        // The stock Table extension binds Tab/Shift-Tab to cell navigation, which
        // fires before ListItem's Tab (sinkListItem) and the Indent plugin can run.
        // Inside a list item, yield (return false) so the event falls through to
        // those handlers and the list nests instead of jumping cells. Elsewhere in
        // a cell, delegate to the stock table navigation.
        const parent = this.parent?.();

        return {
            ...parent,
            Tab: props => (this.editor.isActive("listItem") ? false : (parent?.Tab?.(props) ?? false)),
            "Shift-Tab": props => (this.editor.isActive("listItem") ? false : (parent?.["Shift-Tab"]?.(props) ?? false))
        };
    },

    addAttributes() {
        const styleDataFormat = this.options.styleDataFormat;

        return {
            ...this.parent?.(),
            // Explicit table width (e.g. "400px"). When set, it wins as the table
            // footprint; per-column colwidth continues to feed each column's min-width.
            width: {
                default: null,
                parseHTML: element => {
                    if (styleDataFormat === "class") {
                        return element.getAttribute("data-width") || null;
                    } else {
                        return element.style.width || null;
                    }
                },
                renderHTML: () => {
                    // Handled in the main renderHTML (merged into the style string / class attrs)
                    return {};
                }
            },
            // Explicit table minimum height (e.g. "200px"). Rows still grow with content.
            minHeight: {
                default: null,
                parseHTML: element => {
                    if (styleDataFormat === "class") {
                        return element.getAttribute("data-min-height") || null;
                    } else {
                        return element.style.minHeight || null;
                    }
                },
                renderHTML: () => {
                    // Handled in the main renderHTML (merged into the style string / class attrs)
                    return {};
                }
            },
            backgroundColor: {
                default: null,
                parseHTML: element => {
                    if (styleDataFormat === "class") {
                        return element.getAttribute("data-background-color") || null;
                    } else {
                        return element.style.backgroundColor || null;
                    }
                },
                renderHTML: attributes => {
                    if (!attributes.backgroundColor) {
                        return {};
                    }

                    if (styleDataFormat === "class") {
                        return {
                            "data-background-color": attributes.backgroundColor,
                            class: "has-background-color"
                        };
                    } else {
                        // Return empty here - we'll handle it in the main renderHTML
                        return {};
                    }
                }
            },
            // Table border color attribute - stores custom border color for the entire table
            // Supports both inline style and class-based rendering modes
            borderColor: {
                default: null,
                parseHTML: element => {
                    if (styleDataFormat === "class") {
                        return element.getAttribute("data-border-color") || null;
                    } else {
                        return element.style.borderColor || null;
                    }
                },
                renderHTML: attributes => {
                    if (!attributes.borderColor) {
                        return {};
                    }

                    if (styleDataFormat === "class") {
                        return {
                            "data-border-color": attributes.borderColor,
                            class: "has-table-border"
                        };
                    } else {
                        // Return empty here - we'll handle it in the main renderHTML
                        return {};
                    }
                }
            },
            // Table border style attribute - supports CSS border-style values (solid, dashed, dotted, etc.)
            borderStyle: {
                default: null,
                parseHTML: element => {
                    if (styleDataFormat === "class") {
                        return element.getAttribute("data-border-style") || null;
                    } else {
                        return element.style.borderStyle || null;
                    }
                },
                renderHTML: attributes => {
                    if (!attributes.borderStyle) {
                        return {};
                    }

                    if (styleDataFormat === "class") {
                        return {
                            "data-border-style": attributes.borderStyle
                        };
                    } else {
                        // Return empty here - we'll handle it in the main renderHTML
                        return {};
                    }
                }
            },
            // Table border width attribute - stores border width in pixels (e.g., "1px", "2px")
            borderWidth: {
                default: null,
                parseHTML: element => {
                    if (styleDataFormat === "class") {
                        return element.getAttribute("data-border-width") || null;
                    } else {
                        return element.style.borderWidth || null;
                    }
                },
                renderHTML: attributes => {
                    if (!attributes.borderWidth) {
                        return {};
                    }

                    if (styleDataFormat === "class") {
                        return {
                            "data-border-width": attributes.borderWidth
                        };
                    } else {
                        // Return empty here - we'll handle it in the main renderHTML
                        return {};
                    }
                }
            }
        };
    },

    renderHTML({ node, HTMLAttributes }): DOMOutputSpec {
        const { colgroup, tableWidth, tableMinWidth } = createColGroup(node, this.options.cellMinWidth || 25);

        // Get style attributes from node (all validated before entering the style string)
        const explicitWidth = safeSize(node.attrs.width);
        const minHeight = safeSize(node.attrs.minHeight);
        const backgroundColor = safeColor(node.attrs.backgroundColor);

        // Build the style string by merging table width, background, and border properties
        const segments: string[] = [];

        // Explicit table width wins as the footprint; otherwise fall back to the
        // colwidth-derived width/min-width. Per-column min-width still comes from colgroup.
        if (explicitWidth) {
            segments.push(`width: ${explicitWidth}`);
        } else if (tableWidth) {
            segments.push(`width: ${tableWidth}`);
        } else if (tableMinWidth) {
            segments.push(`min-width: ${tableMinWidth}`);
        }

        // Explicit table minimum height (rows still grow with content)
        if (minHeight) {
            segments.push(`min-height: ${minHeight}`);
        }

        if (this.options.styleDataFormat === "inline") {
            // Add background color if present
            if (backgroundColor) {
                segments.push(`background-color: ${backgroundColor}`);
            }
            // Add border properties if present (validated)
            segments.push(
                ...buildBorderStyleSegments(node.attrs.borderColor, node.attrs.borderStyle, node.attrs.borderWidth)
            );
        }

        const styleString = segments.join("; ");

        // Build class-based attributes for border properties
        const classAttrs: Record<string, any> = {};
        if (this.options.styleDataFormat === "class") {
            const borderColor = safeColor(node.attrs.borderColor);
            const borderStyle =
                node.attrs.borderStyle && isSafeCssBorderStyle(node.attrs.borderStyle) ? node.attrs.borderStyle : null;
            const borderWidth = safeSize(node.attrs.borderWidth);
            if (explicitWidth) {
                classAttrs["data-width"] = explicitWidth;
            }
            if (minHeight) {
                classAttrs["data-min-height"] = minHeight;
            }
            if (backgroundColor) {
                classAttrs["data-background-color"] = backgroundColor;
                classAttrs.class = "has-background-color";
            }
            if (borderColor || borderStyle || borderWidth) {
                if (borderColor) classAttrs["data-border-color"] = borderColor;
                if (borderStyle) classAttrs["data-border-style"] = borderStyle;
                if (borderWidth) classAttrs["data-border-width"] = borderWidth;
                classAttrs.class = classAttrs.class ? `${classAttrs.class} has-table-border` : "has-table-border";
            }
        }

        // Merge all attributes
        const attrs = mergeAttributes(
            this.options.HTMLAttributes || {},
            HTMLAttributes,
            styleString ? { style: styleString } : {},
            this.options.styleDataFormat === "class" ? classAttrs : {}
        );

        const table: DOMOutputSpec = ["table", attrs, colgroup, ["tbody", 0]];

        return this.options.renderWrapper ? ["div", { class: "tableWrapper" }, table] : table;
    },

    addCommands() {
        return {
            ...this.parent?.(),
            setTableBorderStyle:
                (borderStyle: string) =>
                ({ state, dispatch }) => {
                    const { selection } = state;
                    const { $from } = selection;

                    for (let depth = $from.depth; depth > 0; depth--) {
                        const node = $from.node(depth);
                        if (node.type.name === "table") {
                            if (dispatch) {
                                const pos = $from.before(depth);
                                const tr = state.tr.setNodeMarkup(pos, undefined, {
                                    ...node.attrs,
                                    borderStyle
                                });
                                dispatch(tr);
                            }
                            return true;
                        }
                    }
                    return false;
                },
            setTableBorderWidth:
                (borderWidth: string) =>
                ({ state, dispatch }) => {
                    const { selection } = state;
                    const { $from } = selection;

                    for (let depth = $from.depth; depth > 0; depth--) {
                        const node = $from.node(depth);
                        if (node.type.name === "table") {
                            if (dispatch) {
                                const pos = $from.before(depth);
                                const tr = state.tr.setNodeMarkup(pos, undefined, {
                                    ...node.attrs,
                                    borderWidth
                                });
                                dispatch(tr);
                            }
                            return true;
                        }
                    }
                    return false;
                },
            setTableWidth:
                (width: string | null) =>
                ({ state, dispatch }) => {
                    const { $from } = state.selection;

                    for (let depth = $from.depth; depth > 0; depth--) {
                        const node = $from.node(depth);
                        if (node.type.name === "table") {
                            if (dispatch) {
                                const pos = $from.before(depth);
                                const tr = state.tr.setNodeMarkup(pos, undefined, {
                                    ...node.attrs,
                                    width
                                });
                                dispatch(tr);
                            }
                            return true;
                        }
                    }
                    return false;
                },
            setTableMinHeight:
                (minHeight: string | null) =>
                ({ state, dispatch }) => {
                    const { $from } = state.selection;

                    for (let depth = $from.depth; depth > 0; depth--) {
                        const node = $from.node(depth);
                        if (node.type.name === "table") {
                            if (dispatch) {
                                const pos = $from.before(depth);
                                const tr = state.tr.setNodeMarkup(pos, undefined, {
                                    ...node.attrs,
                                    minHeight
                                });
                                dispatch(tr);
                            }
                            return true;
                        }
                    }
                    return false;
                }
        };
    },

    addNodeView() {
        // Only add custom NodeView if resizable, otherwise use default rendering
        if (!this.options.resizable || !this.editor.isEditable) {
            return null;
        }

        return ({ node, getPos, view }) => {
            return new TableBackgroundColorNodeView(
                node,
                view,
                getPos as () => number,
                this.options.cellMinWidth || 25,
                this.options.styleDataFormat || "inline"
            );
        };
    }
});

class TableBackgroundColorNodeView implements NodeView {
    // Table size clamp bounds (see design.md — resolved question 2)
    private static readonly MIN_WIDTH = 50;
    private static readonly MAX_WIDTH = 2000;
    private static readonly MIN_HEIGHT = 30;
    private static readonly MAX_HEIGHT = 1000;

    node: ProseMirrorNode;
    view: EditorView;
    getPos: () => number;
    cellMinWidth: number;
    styleDataFormat: "inline" | "class";
    dom: HTMLElement;
    table: HTMLTableElement;
    contentDOM: HTMLElement;
    // Resize-handle elements (only present in editable mode)
    resizeHandles: HTMLElement[] = [];
    // Live dimensions during a drag — instance fields avoid the stale-closure trap
    // that the React-based ImageResize has to solve with a ref.
    private currentWidth: string | null = null;
    private currentMinHeight: string | null = null;
    private removeDragListeners: (() => void) | null = null;

    constructor(
        node: ProseMirrorNode,
        view: EditorView,
        getPos: () => number,
        cellMinWidth: number,
        styleDataFormat: "inline" | "class"
    ) {
        this.node = node;
        this.view = view;
        this.getPos = getPos;
        this.cellMinWidth = cellMinWidth;
        this.styleDataFormat = styleDataFormat;

        // Create wrapper div
        this.dom = document.createElement("div");
        this.dom.className = "tableWrapper";
        // Anchor absolutely-positioned resize handles
        this.dom.style.position = "relative";

        // Create table element
        this.table = document.createElement("table");
        this.dom.appendChild(this.table);

        // Create colgroup
        this.updateColgroup();

        // Create tbody as contentDOM
        this.contentDOM = document.createElement("tbody");
        this.table.appendChild(this.contentDOM);

        // Apply styling (background and border)
        this.updateTableStyles();

        // Add drag-to-resize handles (SE corner + E edge + S edge)
        this.setupResizeHandles();
    }

    setupResizeHandles(): void {
        const corners: Array<{ className: string; axis: "both" | "x" | "y" }> = [
            { className: "table-resize-handle table-resize-handle-e", axis: "x" },
            { className: "table-resize-handle table-resize-handle-s", axis: "y" },
            { className: "table-resize-handle table-resize-handle-se", axis: "both" }
        ];

        corners.forEach(({ className, axis }) => {
            const handle = document.createElement("div");
            handle.className = className;
            handle.contentEditable = "false";
            handle.addEventListener("mousedown", e => this.startResize(e, axis));
            this.dom.appendChild(handle);
            this.resizeHandles.push(handle);
        });
    }

    startResize(event: MouseEvent, axis: "both" | "x" | "y"): void {
        event.preventDefault();
        event.stopPropagation();

        const rect = this.table.getBoundingClientRect();
        const startX = event.clientX;
        const startY = event.clientY;
        const startWidth = rect.width;
        const startHeight = rect.height;

        // Seed live values from current rendered size
        this.currentWidth = `${Math.round(startWidth)}px`;
        this.currentMinHeight = `${Math.round(startHeight)}px`;

        const onMouseMove = (moveEvent: MouseEvent): void => {
            if (axis === "x" || axis === "both") {
                const newWidth = Math.max(
                    TableBackgroundColorNodeView.MIN_WIDTH,
                    Math.min(TableBackgroundColorNodeView.MAX_WIDTH, startWidth + (moveEvent.clientX - startX))
                );
                this.currentWidth = `${Math.round(newWidth)}px`;
                // Live preview — mutate DOM only (committed once on mouseup)
                this.table.style.width = this.currentWidth;
            }

            if (axis === "y" || axis === "both") {
                const newHeight = Math.max(
                    TableBackgroundColorNodeView.MIN_HEIGHT,
                    Math.min(TableBackgroundColorNodeView.MAX_HEIGHT, startHeight + (moveEvent.clientY - startY))
                );
                this.currentMinHeight = `${Math.round(newHeight)}px`;
                this.table.style.minHeight = this.currentMinHeight;
            }
        };

        const onMouseUp = (): void => {
            this.removeDragListeners?.();
            this.removeDragListeners = null;
            this.commitSize(axis);
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
        this.removeDragListeners = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        };
    }

    // Commit the dragged size as a single undoable change (never per-frame)
    commitSize(axis: "both" | "x" | "y"): void {
        const pos = this.getPos();
        if (typeof pos !== "number") {
            return;
        }

        const attrs: Record<string, any> = { ...this.node.attrs };
        if (axis === "x" || axis === "both") {
            attrs.width = this.currentWidth;
        }
        if (axis === "y" || axis === "both") {
            attrs.minHeight = this.currentMinHeight;
        }

        const tr = this.view.state.tr.setNodeMarkup(pos, undefined, attrs);
        this.view.dispatch(tr);
    }

    updateColgroup(): void {
        // Remove existing colgroup if any
        const existingColgroup = this.table.querySelector("colgroup");
        if (existingColgroup) {
            existingColgroup.remove();
        }

        // Create new colgroup
        const { colgroup } = createColGroup(this.node, this.cellMinWidth);
        const colgroupElement = this.createElementFromSpec(colgroup as unknown as DOMOutputSpec);
        this.table.insertBefore(colgroupElement, this.contentDOM);
    }

    updateTableStyles(): void {
        // Validate every value before it reaches cssText (which parses a full
        // declaration block and would otherwise allow property injection).
        const explicitWidth = safeSize(this.node.attrs.width);
        const minHeight = safeSize(this.node.attrs.minHeight);
        const backgroundColor = safeColor(this.node.attrs.backgroundColor);
        const borderColor = safeColor(this.node.attrs.borderColor);
        const borderStyle =
            this.node.attrs.borderStyle && isSafeCssBorderStyle(this.node.attrs.borderStyle)
                ? this.node.attrs.borderStyle
                : null;
        const borderWidth = safeSize(this.node.attrs.borderWidth);
        const { tableWidth, tableMinWidth } = createColGroup(this.node, this.cellMinWidth);

        // Build style string; explicit table width wins over the colwidth-derived width
        const segments: string[] = [];
        if (explicitWidth) {
            segments.push(`width: ${explicitWidth}`);
        } else if (tableWidth) {
            segments.push(`width: ${tableWidth}`);
        } else if (tableMinWidth) {
            segments.push(`min-width: ${tableMinWidth}`);
        }

        // Explicit table minimum height (rows still grow with content)
        if (minHeight) {
            segments.push(`min-height: ${minHeight}`);
        }

        if (this.styleDataFormat === "inline") {
            if (backgroundColor) {
                segments.push(`background-color: ${backgroundColor}`);
            }
            segments.push(
                ...buildBorderStyleSegments(
                    this.node.attrs.borderColor,
                    this.node.attrs.borderStyle,
                    this.node.attrs.borderWidth
                )
            );
        }

        // Always assign so clearing width/height/colors resets stale inline styles
        this.table.style.cssText = segments.join("; ");

        // Handle class-based mode
        if (this.styleDataFormat === "class") {
            // Explicit size
            if (explicitWidth) {
                this.table.setAttribute("data-width", explicitWidth);
            } else {
                this.table.removeAttribute("data-width");
            }
            if (minHeight) {
                this.table.setAttribute("data-min-height", minHeight);
            } else {
                this.table.removeAttribute("data-min-height");
            }

            // Background color
            if (backgroundColor) {
                this.table.setAttribute("data-background-color", backgroundColor);
                this.table.classList.add("has-background-color");
            } else {
                this.table.removeAttribute("data-background-color");
                this.table.classList.remove("has-background-color");
            }

            // Border properties
            if (borderColor || borderStyle || borderWidth) {
                if (borderColor) this.table.setAttribute("data-border-color", borderColor);
                if (borderStyle) this.table.setAttribute("data-border-style", borderStyle);
                if (borderWidth) this.table.setAttribute("data-border-width", borderWidth);
                this.table.classList.add("has-table-border");
            } else {
                this.table.removeAttribute("data-border-color");
                this.table.removeAttribute("data-border-style");
                this.table.removeAttribute("data-border-width");
                this.table.classList.remove("has-table-border");
            }
        }
    }

    createElementFromSpec(spec: DOMOutputSpec): HTMLElement {
        if (typeof spec === "string") {
            return document.createTextNode(spec) as any;
        }

        const specArray = Array.from(spec as readonly any[]);
        const [tag, attrs, ...children] = specArray;
        const element = document.createElement(tag);

        if (attrs && typeof attrs === "object" && !Array.isArray(attrs)) {
            Object.entries(attrs).forEach(([key, value]) => {
                if (key === "style" && typeof value === "string") {
                    element.style.cssText = value;
                } else if (key === "class") {
                    element.className = value as string;
                } else {
                    element.setAttribute(key, value as string);
                }
            });
        }

        if (children) {
            children.forEach((child: any) => {
                if (child !== 0 && child) {
                    // 0 is content hole
                    element.appendChild(this.createElementFromSpec(child));
                }
            });
        }

        return element;
    }

    update(node: ProseMirrorNode): boolean {
        if (node.type !== this.node.type) {
            return false;
        }

        this.node = node;
        this.updateColgroup();
        this.updateTableStyles();
        return true;
    }

    ignoreMutation(mutation: MutationRecord): boolean {
        // Ignore attribute changes on the table (we manage them, incl. live-drag style writes)
        if (mutation.type === "attributes" && mutation.target === this.table) {
            return true;
        }
        // Ignore any mutation originating from our resize handles
        if (this.resizeHandles.some(handle => handle === mutation.target || handle.contains(mutation.target as Node))) {
            return true;
        }
        return false;
    }

    destroy(): void {
        // Remove any in-flight drag listeners if the NodeView is torn down mid-drag
        this.removeDragListeners?.();
        this.removeDragListeners = null;
    }
}
