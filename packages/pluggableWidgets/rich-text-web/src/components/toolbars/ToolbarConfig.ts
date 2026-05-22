import { Editor } from "@tiptap/react";
import { createContext } from "react";

export type ToolbarActionType =
    | "toggle"
    | "command"
    | "custom"
    | "heading"
    | "dropdown"
    | "tableGrid"
    | "colorPicker"
    | "dialog"
    | "codeView";

export type ColorPickerCommand = "textColor" | "textHighlight" | "cellBackground" | "tableBackground";

export type DialogCommand = "insertImage" | "insertVideo" | "insertLink";

export type TableGridCommand = "insertTable";

export type DropdownCommand = ColorPickerCommand | DialogCommand | TableGridCommand;

export interface ToolbarDropdownOption {
    label: string;
    value: string;
    command: string;
    attrs?: Record<string, any>;
}

export interface ToolbarButtonConfig {
    name: string;
    title: string;
    icon: string;
    action: ToolbarActionType;
    command?: string;
    isActive?: (editor: Editor) => boolean;
    canExecute?: (editor: Editor) => boolean;
    customAction?: (editor: Editor) => void;
    attrs?: Record<string, any>;
    dropdownOptions?: ToolbarDropdownOption[];
    getCurrentValue?: (editor: Editor) => string;
}

export interface ToolbarGroupConfig {
    name: string;
    buttons: ToolbarButtonConfig[];
    showWhen?: (editor: Editor | null) => boolean;
}

export interface ToolbarContextType {
    activeDropdown: DropdownCommand | null;
    handleDropdownToggle: (dropdownType: DropdownCommand | null) => void;
    handleDropdownClose: () => void;
}

export const ToolbarContext = createContext<ToolbarContextType>({
    activeDropdown: null,
    handleDropdownToggle: () => {},
    handleDropdownClose: () => {}
});

// Toolbar configuration
export const TOOLBAR_GROUPS: ToolbarGroupConfig[] = [
    {
        name: "history",
        buttons: [
            {
                name: "undo",
                title: "Undo",
                icon: "Undo",
                action: "command",
                command: "undo",
                canExecute: editor => editor.can().chain().focus().undo().run()
            },
            {
                name: "redo",
                title: "Redo",
                icon: "Redo",
                action: "command",
                command: "redo",
                canExecute: editor => editor.can().chain().focus().redo().run()
            }
        ]
    },
    {
        name: "fontStyle",
        buttons: [
            {
                name: "bold",
                title: "Bold",
                icon: "Text-bold",
                action: "toggle",
                command: "toggleBold",
                isActive: editor => editor.isActive("bold"),
                canExecute: editor => editor.can().chain().focus().toggleBold().run()
            },
            {
                name: "italic",
                title: "Italic",
                icon: "Text-italic",
                action: "toggle",
                command: "toggleItalic",
                isActive: editor => editor.isActive("italic"),
                canExecute: editor => editor.can().chain().focus().toggleItalic().run()
            },
            {
                name: "underline",
                title: "Underline",
                icon: "Text-underline",
                action: "toggle",
                command: "toggleUnderline",
                isActive: editor => editor.isActive("underline"),
                canExecute: editor => editor.can().chain().focus().toggleUnderline().run()
            },
            {
                name: "strike",
                title: "Strikethrough",
                icon: "Text-strikethrough",
                action: "toggle",
                command: "toggleStrike",
                isActive: editor => editor.isActive("strike"),
                canExecute: editor => editor.can().chain().focus().toggleStrike().run()
            }
        ]
    },
    {
        name: "fontScript",
        buttons: [
            {
                name: "superscript",
                title: "Superscript",
                icon: "Text-superscript",
                action: "toggle",
                command: "toggleSuperscript",
                isActive: editor => editor.isActive("superscript"),
                canExecute: editor => editor.can().chain().focus().toggleSuperscript().run()
            },
            {
                name: "subscript",
                title: "Subscript",
                icon: "Text-subscript",
                action: "toggle",
                command: "toggleSubscript",
                isActive: editor => editor.isActive("subscript"),
                canExecute: editor => editor.can().chain().focus().toggleSubscript().run()
            }
        ]
    },
    {
        name: "list",
        buttons: [
            {
                name: "textFormat",
                title: "Text Format",
                icon: "Arrow-down",
                action: "dropdown",
                dropdownOptions: [
                    { label: "Paragraph", value: "paragraph", command: "setParagraph" },
                    { label: "Heading 1", value: "h1", command: "toggleHeading", attrs: { level: 1 } },
                    { label: "Heading 2", value: "h2", command: "toggleHeading", attrs: { level: 2 } },
                    { label: "Heading 3", value: "h3", command: "toggleHeading", attrs: { level: 3 } },
                    { label: "Heading 4", value: "h4", command: "toggleHeading", attrs: { level: 4 } },
                    { label: "Heading 5", value: "h5", command: "toggleHeading", attrs: { level: 5 } },
                    { label: "Heading 6", value: "h6", command: "toggleHeading", attrs: { level: 6 } }
                ],
                getCurrentValue: editor => {
                    if (editor.isActive("heading", { level: 1 })) return "h1";
                    if (editor.isActive("heading", { level: 2 })) return "h2";
                    if (editor.isActive("heading", { level: 3 })) return "h3";
                    if (editor.isActive("heading", { level: 4 })) return "h4";
                    if (editor.isActive("heading", { level: 5 })) return "h5";
                    if (editor.isActive("heading", { level: 6 })) return "h6";
                    return "paragraph";
                }
            }
        ]
    },
    {
        name: "list",
        buttons: [
            {
                name: "listFormat",
                title: "List Format",
                icon: "List-bullets",
                action: "dropdown",
                dropdownOptions: [
                    { label: "Bullet List", value: "bulletList", command: "toggleBulletList" },
                    { label: "Numbered List", value: "orderedList", command: "toggleOrderedList" },
                    { label: "Task List", value: "taskList", command: "toggleTaskList" }
                ],
                getCurrentValue: editor => {
                    if (editor.isActive("bulletList")) return "bulletList";
                    if (editor.isActive("orderedList")) return "orderedList";
                    if (editor.isActive("taskList")) return "taskList";
                    return "";
                }
            }
        ]
    },
    {
        name: "indent",
        buttons: [
            {
                name: "decreaseIndent",
                title: "Decrease Indent",
                icon: "Text-indent-right",
                action: "command",
                command: "decreaseIndent"
            },
            {
                name: "increaseIndent",
                title: "Increase Indent",
                icon: "Text-indent-left",
                action: "command",
                command: "increaseIndent"
            },
            {
                name: "textDirection",
                title: "Text Direction",
                icon: "Left-to-right",
                action: "dropdown",
                dropdownOptions: [
                    { label: "Left to Right", value: "ltr", command: "setTextDirection", attrs: { direction: "ltr" } },
                    { label: "Right to Left", value: "rtl", command: "setTextDirection", attrs: { direction: "rtl" } }
                ],
                getCurrentValue: editor => {
                    const attrs = editor.getAttributes("paragraph");
                    if (attrs.dir === "rtl") return "rtl";
                    return "ltr";
                }
            }
        ]
    },
    {
        name: "align",
        buttons: [
            {
                name: "textAlign",
                title: "Text Alignment",
                icon: "Align-left",
                action: "dropdown",
                dropdownOptions: [
                    { label: "Left", value: "left", command: "setTextAlign", attrs: { textAlign: "left" } },
                    { label: "Center", value: "center", command: "setTextAlign", attrs: { textAlign: "center" } },
                    { label: "Right", value: "right", command: "setTextAlign", attrs: { textAlign: "right" } },
                    { label: "Justify", value: "justify", command: "setTextAlign", attrs: { textAlign: "justify" } }
                ],
                getCurrentValue: editor => {
                    if (editor.isActive({ textAlign: "left" })) return "left";
                    if (editor.isActive({ textAlign: "center" })) return "center";
                    if (editor.isActive({ textAlign: "right" })) return "right";
                    if (editor.isActive({ textAlign: "justify" })) return "justify";
                    return "left";
                }
            }
        ]
    },
    {
        name: "fontColor",
        buttons: [
            {
                name: "fontFamily",
                title: "Font Family",
                icon: "Text-font",
                action: "dropdown",
                dropdownOptions: [
                    { label: "Default", value: "", command: "setFontFamily", attrs: { fontFamily: "" } },
                    { label: "Arial", value: "Arial", command: "setFontFamily", attrs: { fontFamily: "Arial" } },
                    {
                        label: "Arial Black",
                        value: "Arial Black",
                        command: "setFontFamily",
                        attrs: { fontFamily: "Arial Black" }
                    },
                    {
                        label: "Comic Sans MS",
                        value: "Comic Sans MS",
                        command: "setFontFamily",
                        attrs: { fontFamily: "Comic Sans MS" }
                    },
                    {
                        label: "Courier New",
                        value: "Courier New",
                        command: "setFontFamily",
                        attrs: { fontFamily: "Courier New" }
                    },
                    { label: "Georgia", value: "Georgia", command: "setFontFamily", attrs: { fontFamily: "Georgia" } },
                    { label: "Impact", value: "Impact", command: "setFontFamily", attrs: { fontFamily: "Impact" } },
                    {
                        label: "Times New Roman",
                        value: "Times New Roman",
                        command: "setFontFamily",
                        attrs: { fontFamily: "Times New Roman" }
                    },
                    {
                        label: "Trebuchet MS",
                        value: "Trebuchet MS",
                        command: "setFontFamily",
                        attrs: { fontFamily: "Trebuchet MS" }
                    },
                    { label: "Verdana", value: "Verdana", command: "setFontFamily", attrs: { fontFamily: "Verdana" } }
                ],
                getCurrentValue: editor => {
                    const { fontFamily } = editor.getAttributes("textStyle");
                    return fontFamily || "";
                }
            },
            {
                name: "fontSize",
                title: "Font Size",
                icon: "Text-size",
                action: "dropdown",
                dropdownOptions: [
                    { label: "10px", value: "10px", command: "setFontSize", attrs: { fontSize: "10px" } },
                    { label: "12px", value: "12px", command: "setFontSize", attrs: { fontSize: "12px" } },
                    { label: "14px", value: "14px", command: "setFontSize", attrs: { fontSize: "14px" } },
                    { label: "16px", value: "16px", command: "setFontSize", attrs: { fontSize: "16px" } },
                    { label: "18px", value: "18px", command: "setFontSize", attrs: { fontSize: "18px" } },
                    { label: "20px", value: "20px", command: "setFontSize", attrs: { fontSize: "20px" } },
                    { label: "24px", value: "24px", command: "setFontSize", attrs: { fontSize: "24px" } },
                    { label: "28px", value: "28px", command: "setFontSize", attrs: { fontSize: "28px" } },
                    { label: "32px", value: "32px", command: "setFontSize", attrs: { fontSize: "32px" } },
                    { label: "36px", value: "36px", command: "setFontSize", attrs: { fontSize: "36px" } },
                    { label: "48px", value: "48px", command: "setFontSize", attrs: { fontSize: "48px" } },
                    { label: "64px", value: "64px", command: "setFontSize", attrs: { fontSize: "64px" } }
                ],
                getCurrentValue: editor => {
                    const { fontSize } = editor.getAttributes("textStyle");
                    return fontSize || "16px";
                }
            },
            {
                name: "textColor",
                title: "Text Color",
                icon: "Text-color",
                action: "colorPicker",
                command: "textColor"
            },
            {
                name: "backgroundColor",
                title: "Background Color",
                icon: "Text-background",
                action: "colorPicker",
                command: "textHighlight"
            }
        ]
    },
    {
        name: "embed",
        buttons: [
            {
                name: "insertLink",
                title: "Insert Link",
                icon: "Hyperlink",
                action: "dialog",
                command: "insertLink"
            },
            {
                name: "insertImage",
                title: "Insert Image",
                icon: "Image",
                action: "dialog",
                command: "insertImage"
            },
            {
                name: "insertVideo",
                title: "Insert YouTube Video",
                icon: "Film",
                action: "dialog",
                command: "insertVideo"
            }
        ]
    },
    {
        name: "header",
        buttons: [
            {
                name: "textFormat",
                title: "Text Format",
                icon: "Arrow-down",
                action: "dropdown",
                dropdownOptions: [
                    { label: "Paragraph", value: "paragraph", command: "setParagraph" },
                    { label: "Heading 1", value: "h1", command: "toggleHeading", attrs: { level: 1 } },
                    { label: "Heading 2", value: "h2", command: "toggleHeading", attrs: { level: 2 } },
                    { label: "Heading 3", value: "h3", command: "toggleHeading", attrs: { level: 3 } },
                    { label: "Heading 4", value: "h4", command: "toggleHeading", attrs: { level: 4 } },
                    { label: "Heading 5", value: "h5", command: "toggleHeading", attrs: { level: 5 } },
                    { label: "Heading 6", value: "h6", command: "toggleHeading", attrs: { level: 6 } }
                ],
                getCurrentValue: editor => {
                    if (editor.isActive("heading", { level: 1 })) return "h1";
                    if (editor.isActive("heading", { level: 2 })) return "h2";
                    if (editor.isActive("heading", { level: 3 })) return "h3";
                    if (editor.isActive("heading", { level: 4 })) return "h4";
                    if (editor.isActive("heading", { level: 5 })) return "h5";
                    if (editor.isActive("heading", { level: 6 })) return "h6";
                    return "paragraph";
                }
            }
        ]
    },
    {
        name: "code",
        buttons: [
            {
                name: "blockquote",
                title: "Blockquote",
                icon: "Blockquote",
                action: "toggle",
                command: "toggleBlockquote",
                isActive: editor => editor.isActive("blockquote")
            },
            {
                name: "code",
                title: "Code",
                icon: "Inline-code",
                action: "toggle",
                command: "toggleCode",
                isActive: editor => editor.isActive("code"),
                canExecute: editor => editor.can().chain().focus().toggleCode().run()
            },
            {
                name: "codeBlock",
                title: "Code Block",
                icon: "Code-block",
                action: "toggle",
                command: "toggleCodeBlock",
                isActive: editor => editor.isActive("codeBlock")
            }
        ]
    },
    {
        name: "remove",
        buttons: [
            {
                name: "clearFormatting",
                title: "Clear Formatting",
                icon: "Erase",
                action: "command",
                command: "unsetAllMarks"
            }
        ]
    },
    {
        name: "view",
        buttons: [
            {
                name: "codeView",
                title: "View/Edit Code",
                icon: "View-edit-code",
                action: "codeView"
            }
        ]
    },
    {
        name: "tableBetter",
        buttons: [
            {
                name: "insertTable",
                title: "Insert Table",
                icon: "Table",
                action: "tableGrid"
            }
        ]
    }
];

export const SECONDARY_TOOLBAR_GROUP: ToolbarGroupConfig[] = [
    {
        name: "table-operations",
        showWhen: editor => editor?.isActive("table") ?? false,
        buttons: [
            {
                name: "addColumnBefore",
                title: "Add Column Before",
                icon: "Column",
                action: "command",
                command: "addColumnBefore",
                canExecute: editor => editor.can().addColumnBefore()
            },
            {
                name: "addColumnAfter",
                title: "Add Column After",
                icon: "Column",
                action: "command",
                command: "addColumnAfter",
                canExecute: editor => editor.can().addColumnAfter()
            },
            {
                name: "deleteColumn",
                title: "Delete Column",
                icon: "Delete",
                action: "command",
                command: "deleteColumn",
                canExecute: editor => editor.can().deleteColumn()
            },
            {
                name: "addRowBefore",
                title: "Add Row Before",
                icon: "Row",
                action: "command",
                command: "addRowBefore",
                canExecute: editor => editor.can().addRowBefore()
            },
            {
                name: "addRowAfter",
                title: "Add Row After",
                icon: "Row",
                action: "command",
                command: "addRowAfter",
                canExecute: editor => editor.can().addRowAfter()
            },
            {
                name: "deleteRow",
                title: "Delete Row",
                icon: "Delete",
                action: "command",
                command: "deleteRow",
                canExecute: editor => editor.can().deleteRow()
            },
            {
                name: "deleteTable",
                title: "Delete Table",
                icon: "Close",
                action: "command",
                command: "deleteTable",
                canExecute: editor => editor.can().deleteTable()
            },
            {
                name: "mergeCells",
                title: "Merge Cells",
                icon: "Merge",
                action: "command",
                command: "mergeCells",
                canExecute: editor => editor.can().mergeCells()
            },
            {
                name: "splitCell",
                title: "Split Cell",
                icon: "Cell",
                action: "command",
                command: "splitCell",
                canExecute: editor => editor.can().splitCell()
            },
            {
                name: "cellBackgroundColor",
                title: "Cell Background Color",
                icon: "Palette",
                action: "colorPicker",
                command: "cellBackground"
            },
            {
                name: "tableBackgroundColor",
                title: "Table Background Color",
                icon: "Palette",
                action: "colorPicker",
                command: "tableBackground"
            }
        ]
    }
];
