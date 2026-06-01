import { mergeAttributes } from "@tiptap/core";
import { Table } from "@tiptap/extension-table";
import { DOMOutputSpec, Node as ProseMirrorNode } from "@tiptap/pm/model";
import { EditorView, NodeView } from "@tiptap/pm/view";

// Declare custom commands for table border styling
declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        tableBackgroundColor: {
            setTableBorderStyle: (borderStyle: string) => ReturnType;
            setTableBorderWidth: (borderWidth: string) => ReturnType;
        };
    }
}

// Helper to create colgroup (copied from TipTap source)
function createColGroup(node: any, cellMinWidth: number) {
    let totalWidth = 0;
    let fixedWidth = true;
    const cols: any[] = [];
    const row = node.firstChild;

    if (!row) {
        return { colgroup: ["colgroup"], tableWidth: "", tableMinWidth: "" };
    }

    for (let i = 0, col = 0; i < row.childCount; i += 1) {
        const { colspan, colwidth } = row.child(i).attrs;
        for (let j = 0; j < colspan; j += 1, col += 1) {
            const hasWidth = colwidth && colwidth[j];
            const cssWidth = hasWidth ? colwidth[j] + "px" : "";
            totalWidth += hasWidth ? colwidth[j] : cellMinWidth;
            if (!hasWidth) {
                fixedWidth = false;
            }
            cols.push(["col", cssWidth ? { style: `min-width: ${cssWidth}` } : {}]);
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

    addAttributes() {
        const styleDataFormat = this.options.styleDataFormat;

        return {
            ...this.parent?.(),
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

        // Get style attributes from node
        const backgroundColor = node.attrs.backgroundColor;
        const borderColor = node.attrs.borderColor;
        const borderStyle = node.attrs.borderStyle;
        const borderWidth = node.attrs.borderWidth;

        // Build the style string by merging table width, background, and border properties
        let styleString = "";

        // Add table width or min-width
        if (tableWidth) {
            styleString = `width: ${tableWidth}`;
        } else if (tableMinWidth) {
            styleString = `min-width: ${tableMinWidth}`;
        }

        // Add background color if present (inline mode)
        if (backgroundColor && this.options.styleDataFormat === "inline") {
            styleString += styleString
                ? `; background-color: ${backgroundColor}`
                : `background-color: ${backgroundColor}`;
        }

        // Add border properties if present (inline mode)
        if (this.options.styleDataFormat === "inline") {
            // If any border property is set, we need to ensure border-style is set for the border to be visible
            const hasBorderProperties = borderColor || borderStyle || borderWidth;

            if (hasBorderProperties) {
                // Always set border-style first (default to 'solid' if not specified)
                const effectiveBorderStyle = borderStyle || "solid";
                styleString += styleString
                    ? `; border-style: ${effectiveBorderStyle}`
                    : `border-style: ${effectiveBorderStyle}`;

                // Set border-width (default to '1px' if not specified)
                const effectiveBorderWidth = borderWidth || "1px";
                styleString += `; border-width: ${effectiveBorderWidth}`;

                // Set border-color if specified
                if (borderColor) {
                    styleString += `; border-color: ${borderColor}`;
                }
            }
        }

        // Build class-based attributes for border properties
        const classAttrs: Record<string, any> = {};
        if (this.options.styleDataFormat === "class") {
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
    node: ProseMirrorNode;
    view: EditorView;
    getPos: () => number;
    cellMinWidth: number;
    styleDataFormat: "inline" | "class";
    dom: HTMLElement;
    table: HTMLTableElement;
    contentDOM: HTMLElement;

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
    }

    updateColgroup() {
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

    updateTableStyles() {
        const backgroundColor = this.node.attrs.backgroundColor;
        const borderColor = this.node.attrs.borderColor;
        const borderStyle = this.node.attrs.borderStyle;
        const borderWidth = this.node.attrs.borderWidth;
        const { tableWidth, tableMinWidth } = createColGroup(this.node, this.cellMinWidth);

        // Build style string for inline mode
        let styleString = "";
        if (tableWidth) {
            styleString = `width: ${tableWidth}`;
        } else if (tableMinWidth) {
            styleString = `min-width: ${tableMinWidth}`;
        }

        if (this.styleDataFormat === "inline") {
            if (backgroundColor) {
                styleString += styleString
                    ? `; background-color: ${backgroundColor}`
                    : `background-color: ${backgroundColor}`;
            }

            // If any border property is set, ensure border-style is set for visibility
            const hasBorderProperties = borderColor || borderStyle || borderWidth;
            if (hasBorderProperties) {
                // Always set border-style first (default to 'solid' if not specified)
                const effectiveBorderStyle = borderStyle || "solid";
                styleString += styleString
                    ? `; border-style: ${effectiveBorderStyle}`
                    : `border-style: ${effectiveBorderStyle}`;

                // Set border-width (default to '1px' if not specified)
                const effectiveBorderWidth = borderWidth || "1px";
                styleString += `; border-width: ${effectiveBorderWidth}`;

                // Set border-color if specified
                if (borderColor) {
                    styleString += `; border-color: ${borderColor}`;
                }
            }
        }

        if (styleString) {
            this.table.style.cssText = styleString;
        }

        // Handle class-based mode
        if (this.styleDataFormat === "class") {
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

    update(node: ProseMirrorNode) {
        if (node.type !== this.node.type) {
            return false;
        }

        this.node = node;
        this.updateColgroup();
        this.updateTableStyles();
        return true;
    }

    ignoreMutation(mutation: MutationRecord) {
        // Ignore attribute changes on the table (we manage them)
        if (mutation.type === "attributes" && mutation.target === this.table) {
            return true;
        }
        return false;
    }

    destroy() {
        // Cleanup if needed
    }
}
