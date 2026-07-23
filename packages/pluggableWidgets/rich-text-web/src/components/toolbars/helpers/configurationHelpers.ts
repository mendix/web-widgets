import { Editor } from "@tiptap/react";
import { normalizeCssSize } from "../../../utils/helpers";
import { TranslateFn } from "../../../utils/i18n";
import { ConfigurationSection } from "../ToolbarConfig";

// Helper to get table node attributes
function getTableAttributes(editor: Editor): Record<string, any> | null {
    const { state } = editor;
    const { $from } = state.selection;

    for (let depth = $from.depth; depth > 0; depth--) {
        const node = $from.node(depth);
        if (node.type.name === "table") {
            return node.attrs;
        }
    }
    return null;
}

// Helper to set a single attribute on the nearest ancestor table node
function setTableAttribute(editor: Editor, attribute: string, value: unknown): void {
    const { state } = editor;
    const { $from } = state.selection;

    for (let depth = $from.depth; depth > 0; depth--) {
        const node = $from.node(depth);
        if (node.type.name === "table") {
            const pos = $from.before(depth);
            editor
                .chain()
                .focus()
                .command(({ tr }) => {
                    tr.setNodeMarkup(pos, undefined, {
                        ...node.attrs,
                        [attribute]: value
                    });
                    return true;
                })
                .run();
            break;
        }
    }
}

// Helper to get cell attributes
function getCellAttributes(editor: Editor): Record<string, any> | null {
    const { state } = editor;
    const { selection } = state;

    // Try to find a cell in the current selection
    const cellPos = selection.$from.pos;
    const resolved = state.doc.resolve(cellPos);

    for (let depth = resolved.depth; depth > 0; depth--) {
        const node = resolved.node(depth);
        if (node.type.name === "tableCell" || node.type.name === "tableHeader") {
            return node.attrs;
        }
    }
    return null;
}

// Table configuration sections
export function createTableConfigurationSections(editor: Editor, t: TranslateFn): ConfigurationSection[] {
    return [
        {
            id: "tableBackground",
            label: t("config.backgroundColor"),
            type: "colorPicker",
            defaultColor: "#ffffff",
            getCurrentValue: () => {
                const attrs = getTableAttributes(editor);
                return attrs?.backgroundColor || null;
            },
            onChange: (color: string) => {
                setTableAttribute(editor, "backgroundColor", color);
            },
            onClear: () => {
                setTableAttribute(editor, "backgroundColor", null);
            }
        },
        {
            id: "tableBorderColor",
            label: t("config.borderColor"),
            type: "colorPicker",
            defaultColor: "#000000",
            getCurrentValue: () => {
                const attrs = getTableAttributes(editor);
                return attrs?.borderColor || null;
            },
            onChange: (color: string) => {
                setTableAttribute(editor, "borderColor", color);
            },
            onClear: () => {
                setTableAttribute(editor, "borderColor", null);
            }
        },
        {
            id: "tableBorderStyle",
            label: t("config.borderStyle"),
            type: "dropdown",
            options: [
                { value: "none", label: t("config.borderStyle.none") },
                { value: "solid", label: t("config.borderStyle.solid") },
                { value: "dashed", label: t("config.borderStyle.dashed") },
                { value: "dotted", label: t("config.borderStyle.dotted") },
                { value: "double", label: t("config.borderStyle.double") },
                { value: "groove", label: t("config.borderStyle.groove") },
                { value: "ridge", label: t("config.borderStyle.ridge") },
                { value: "inset", label: t("config.borderStyle.inset") },
                { value: "outset", label: t("config.borderStyle.outset") }
            ],
            getCurrentValue: () => {
                const attrs = getTableAttributes(editor);
                return attrs?.borderStyle || "none";
            },
            onChange: (style: string) => {
                (editor.chain().focus() as any).setTableBorderStyle(style).run();
            }
        },
        {
            id: "tableBorderWidth",
            label: t("config.borderWidth"),
            type: "dropdown",
            options: [
                { value: "0", label: "0" },
                { value: "1px", label: "1px" },
                { value: "2px", label: "2px" },
                { value: "3px", label: "3px" },
                { value: "4px", label: "4px" },
                { value: "5px", label: "5px" }
            ],
            getCurrentValue: () => {
                const attrs = getTableAttributes(editor);
                return attrs?.borderWidth || "0";
            },
            onChange: (width: string) => {
                (editor.chain().focus() as any).setTableBorderWidth(width).run();
            }
        },
        {
            id: "tableWidth",
            label: t("config.tableWidth"),
            type: "textInput",
            placeholder: t("config.tableWidth.placeholder"),
            getCurrentValue: () => {
                const attrs = getTableAttributes(editor);
                return attrs?.width || null;
            },
            onChange: (value: string) => {
                // Empty clears to auto; otherwise normalize and validate the CSS size
                if (!value || value.trim() === "") {
                    (editor.chain().focus() as any).setTableWidth(null).run();
                    return;
                }
                const size = normalizeCssSize(value);
                if (size === null) {
                    return; // invalid — ignore, keep previous
                }
                (editor.chain().focus() as any).setTableWidth(size).run();
            }
        },
        {
            id: "tableHeight",
            label: t("config.tableHeight"),
            type: "textInput",
            placeholder: t("config.tableHeight.placeholder"),
            getCurrentValue: () => {
                const attrs = getTableAttributes(editor);
                return attrs?.minHeight || null;
            },
            onChange: (value: string) => {
                if (!value || value.trim() === "") {
                    (editor.chain().focus() as any).setTableMinHeight(null).run();
                    return;
                }
                const size = normalizeCssSize(value);
                if (size === null) {
                    return;
                }
                (editor.chain().focus() as any).setTableMinHeight(size).run();
            }
        }
    ];
}

// Cell configuration sections
export function createCellConfigurationSections(editor: Editor, t: TranslateFn): ConfigurationSection[] {
    return [
        {
            id: "cellBackground",
            label: t("config.backgroundColor"),
            type: "colorPicker",
            defaultColor: "#ffffff",
            getCurrentValue: () => {
                const attrs = getCellAttributes(editor);
                return attrs?.backgroundColor || null;
            },
            onChange: (color: string) => {
                editor.chain().focus().setCellAttribute("backgroundColor", color).run();
            },
            onClear: () => {
                editor.chain().focus().setCellAttribute("backgroundColor", null).run();
            }
        },
        {
            id: "cellBorderColor",
            label: t("config.borderColor"),
            type: "colorPicker",
            defaultColor: "#000000",
            getCurrentValue: () => {
                const attrs = getCellAttributes(editor);
                return attrs?.borderColor || null;
            },
            onChange: (color: string) => {
                editor.chain().focus().setCellAttribute("borderColor", color).run();
            },
            onClear: () => {
                editor.chain().focus().setCellAttribute("borderColor", null).run();
            }
        },
        {
            id: "cellBorderStyle",
            label: t("config.borderStyle"),
            type: "dropdown",
            options: [
                { value: "none", label: t("config.borderStyle.none") },
                { value: "solid", label: t("config.borderStyle.solid") },
                { value: "dashed", label: t("config.borderStyle.dashed") },
                { value: "dotted", label: t("config.borderStyle.dotted") },
                { value: "double", label: t("config.borderStyle.double") },
                { value: "groove", label: t("config.borderStyle.groove") },
                { value: "ridge", label: t("config.borderStyle.ridge") },
                { value: "inset", label: t("config.borderStyle.inset") },
                { value: "outset", label: t("config.borderStyle.outset") }
            ],
            getCurrentValue: () => {
                const attrs = getCellAttributes(editor);
                return attrs?.borderStyle || "none";
            },
            onChange: (style: string) => {
                editor.chain().focus().setCellAttribute("borderStyle", style).run();
            }
        },
        {
            id: "cellBorderWidth",
            label: t("config.borderWidth"),
            type: "dropdown",
            options: [
                { value: "0", label: "0" },
                { value: "1px", label: "1px" },
                { value: "2px", label: "2px" },
                { value: "3px", label: "3px" },
                { value: "4px", label: "4px" },
                { value: "5px", label: "5px" }
            ],
            getCurrentValue: () => {
                const attrs = getCellAttributes(editor);
                return attrs?.borderWidth || "0";
            },
            onChange: (width: string) => {
                editor.chain().focus().setCellAttribute("borderWidth", width).run();
            }
        },
        {
            id: "cellWidth",
            label: t("config.columnWidth"),
            type: "textInput",
            placeholder: t("config.columnWidth.placeholder"),
            getCurrentValue: () => {
                const attrs = getCellAttributes(editor);
                return attrs?.cellWidth || null;
            },
            onChange: (value: string) => {
                // Empty clears to auto; otherwise normalize and validate the CSS size
                if (!value || value.trim() === "") {
                    editor.chain().focus().setCellAttribute("cellWidth", null).run();
                    return;
                }
                const size = normalizeCssSize(value);
                if (size === null) {
                    return; // invalid — ignore, keep previous
                }
                editor.chain().focus().setCellAttribute("cellWidth", size).run();
            }
        },
        {
            id: "cellHeight",
            label: t("config.columnHeight"),
            type: "textInput",
            placeholder: t("config.columnHeight.placeholder"),
            getCurrentValue: () => {
                const attrs = getCellAttributes(editor);
                return attrs?.cellHeight || null;
            },
            onChange: (value: string) => {
                if (!value || value.trim() === "") {
                    editor.chain().focus().setCellAttribute("cellHeight", null).run();
                    return;
                }
                const size = normalizeCssSize(value);
                if (size === null) {
                    return; // invalid — ignore, keep previous
                }
                editor.chain().focus().setCellAttribute("cellHeight", size).run();
            }
        }
    ];
}
