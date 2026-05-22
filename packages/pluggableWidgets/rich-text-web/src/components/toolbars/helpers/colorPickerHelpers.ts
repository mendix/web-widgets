import { Editor } from "@tiptap/react";
import { ColorPickerCommand } from "../ToolbarConfig";

interface ColorPickerHelpers {
    getDefaultColor: (pickerType: ColorPickerCommand) => string;
    handleColorChange: (editor: Editor, pickerType: ColorPickerCommand, color: string) => void;
}

export const colorPickerHelpers: ColorPickerHelpers = {
    getDefaultColor: (pickerType: ColorPickerCommand): string => {
        if (pickerType === "textHighlight") return "#ffff00";
        if (pickerType === "cellBackground" || pickerType === "tableBackground") return "#ffffff";
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
    }
};
