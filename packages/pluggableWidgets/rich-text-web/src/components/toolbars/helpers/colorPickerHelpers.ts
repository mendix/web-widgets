import { Editor } from "@tiptap/react";
import { ColorPickerCommand } from "../ToolbarConfig";

interface ColorPickerHelpers {
    getDefaultColor: (pickerType: ColorPickerCommand) => string;
    handleColorChange: (editor: Editor, pickerType: ColorPickerCommand, color: string) => void;
    handleColorClear: (editor: Editor, pickerType: ColorPickerCommand) => void;
}

/** Updates a single attribute on the nearest ancestor `table` node of the selection. */
function updateTableAttribute(editor: Editor, attribute: string, value: unknown): void {
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

export const colorPickerHelpers: ColorPickerHelpers = {
    getDefaultColor: (pickerType: ColorPickerCommand): string => {
        if (pickerType === "textHighlight") return "#ffff00";
        if (pickerType === "cellBackground" || pickerType === "tableBackground") return "#ffffff";
        if (pickerType === "tableBorderColor") return "#000000";
        return "#000000";
    },

    handleColorChange: (editor: Editor, pickerType: ColorPickerCommand, color: string): void => {
        if (pickerType === "textColor") {
            (editor.chain().focus() as any).setTextColor(color).run();
        } else if (pickerType === "textHighlight") {
            (editor.chain().focus() as any).setTextHighlight(color).run();
        } else if (pickerType === "cellBackground") {
            editor.chain().focus().setCellAttribute("backgroundColor", color).run();
        } else if (pickerType === "tableBackground") {
            updateTableAttribute(editor, "backgroundColor", color);
        } else if (pickerType === "tableBorderColor") {
            updateTableAttribute(editor, "borderColor", color);
        }
    },

    handleColorClear: (editor: Editor, pickerType: ColorPickerCommand): void => {
        if (pickerType === "textColor") {
            (editor.chain().focus() as any).unsetTextColor().run();
        } else if (pickerType === "textHighlight") {
            (editor.chain().focus() as any).unsetTextHighlight().run();
        } else if (pickerType === "cellBackground") {
            editor.chain().focus().setCellAttribute("backgroundColor", null).run();
        } else if (pickerType === "tableBackground") {
            updateTableAttribute(editor, "backgroundColor", null);
        } else if (pickerType === "tableBorderColor") {
            updateTableAttribute(editor, "borderColor", null);
        }
    }
};
