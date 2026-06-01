import { Editor } from "@tiptap/react";
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
export function createTableConfigurationSections(editor: Editor): ConfigurationSection[] {
    return [
        {
            id: "tableBackground",
            label: "Background Color",
            type: "colorPicker",
            defaultColor: "#ffffff",
            getCurrentValue: () => {
                const attrs = getTableAttributes(editor);
                return attrs?.backgroundColor || null;
            },
            onChange: (color: string) => {
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
                                    backgroundColor: color
                                });
                                return true;
                            })
                            .run();
                        break;
                    }
                }
            }
        },
        {
            id: "tableBorderColor",
            label: "Border Color",
            type: "colorPicker",
            defaultColor: "#000000",
            getCurrentValue: () => {
                const attrs = getTableAttributes(editor);
                return attrs?.borderColor || null;
            },
            onChange: (color: string) => {
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
                                    borderColor: color
                                });
                                return true;
                            })
                            .run();
                        break;
                    }
                }
            }
        },
        {
            id: "tableBorderStyle",
            label: "Border Style",
            type: "dropdown",
            options: [
                { value: "none", label: "None" },
                { value: "solid", label: "Solid" },
                { value: "dashed", label: "Dashed" },
                { value: "dotted", label: "Dotted" },
                { value: "double", label: "Double" },
                { value: "groove", label: "Groove" },
                { value: "ridge", label: "Ridge" },
                { value: "inset", label: "Inset" },
                { value: "outset", label: "Outset" }
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
            label: "Border Width",
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
        }
    ];
}

// Cell configuration sections
export function createCellConfigurationSections(editor: Editor): ConfigurationSection[] {
    return [
        {
            id: "cellBackground",
            label: "Background Color",
            type: "colorPicker",
            defaultColor: "#ffffff",
            getCurrentValue: () => {
                const attrs = getCellAttributes(editor);
                return attrs?.backgroundColor || null;
            },
            onChange: (color: string) => {
                editor.chain().focus().setCellAttribute("backgroundColor", color).run();
            }
        },
        {
            id: "cellBorderColor",
            label: "Border Color",
            type: "colorPicker",
            defaultColor: "#000000",
            getCurrentValue: () => {
                const attrs = getCellAttributes(editor);
                return attrs?.borderColor || null;
            },
            onChange: (color: string) => {
                editor.chain().focus().setCellAttribute("borderColor", color).run();
            }
        },
        {
            id: "cellBorderStyle",
            label: "Border Style",
            type: "dropdown",
            options: [
                { value: "none", label: "None" },
                { value: "solid", label: "Solid" },
                { value: "dashed", label: "Dashed" },
                { value: "dotted", label: "Dotted" },
                { value: "double", label: "Double" },
                { value: "groove", label: "Groove" },
                { value: "ridge", label: "Ridge" },
                { value: "inset", label: "Inset" },
                { value: "outset", label: "Outset" }
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
            label: "Border Width",
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
        }
    ];
}
