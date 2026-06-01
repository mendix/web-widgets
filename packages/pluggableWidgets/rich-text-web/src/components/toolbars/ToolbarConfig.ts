import { Editor } from "@tiptap/react";
import { createContext } from "react";
import { createTableConfigurationSections, createCellConfigurationSections } from "./helpers/configurationHelpers";
import { PresetEnum, ToolbarConfigEnum, CtItemTypeEnum, AdvancedConfigType } from "../../../typings/RichTextProps";

export type ToolbarActionType =
    | "toggle"
    | "command"
    | "custom"
    | "heading"
    | "dropdown"
    | "tableGrid"
    | "colorPicker"
    | "dialog"
    | "codeView"
    | "configurationDropdown";

export type ColorPickerCommand =
    | "textColor"
    | "textHighlight"
    | "cellBackground"
    | "tableBackground"
    | "tableBorderColor";

export type DialogCommand = "insertImage" | "insertVideo" | "insertLink";

export type TableGridCommand = "insertTable";

export type DropdownCommand = ColorPickerCommand | DialogCommand | TableGridCommand;

export interface ToolbarDropdownOption {
    label: string;
    value: string;
    command: string;
    attrs?: Record<string, any>;
}

export interface ConfigurationSection {
    id: string;
    label: string;
    type: "colorPicker" | "dropdown";
    getCurrentValue?: () => string | null;
    onChange: (value: string) => void;
    options?: Array<{ value: string; label: string }>;
    defaultColor?: string;
}

export interface ToolbarButtonConfig {
    name: string;
    title: string;
    icon: string;
    activeIcon?: string; // Icon to show when button is active
    action: ToolbarActionType;
    command?: string;
    isActive?: (editor: Editor) => boolean;
    canExecute?: (editor: Editor) => boolean;
    customAction?: (editor: Editor) => void | ConfigurationSection[];
    attrs?: Record<string, any>;
    dropdownOptions?: ToolbarDropdownOption[];
    getCurrentValue?: (editor: Editor) => string;
    configurationSections?: ConfigurationSection[];
}

export interface ToolbarGroupConfig {
    name: string;
    presetValue?: 1 | 2 | 3;
    buttons: ToolbarButtonConfig[];
    parentName?: string;
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
        presetValue: 2,
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
        presetValue: 1,
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
        presetValue: 3,
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
        presetValue: 1,
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
        presetValue: 1,
        buttons: [
            {
                name: "bulletList",
                title: "Bullet List",
                icon: "List-bullets",
                action: "toggle",
                command: "toggleBulletList",
                isActive: editor => editor.isActive("bulletList")
            },
            {
                name: "orderedList",
                title: "Numbered List",
                icon: "List-numbers",
                action: "toggle",
                command: "toggleOrderedList",
                isActive: editor => editor.isActive("orderedList")
            },
            {
                name: "taskList",
                title: "Task List",
                icon: "Check",
                action: "toggle",
                command: "toggleTaskList",
                isActive: editor => editor.isActive("taskList")
            }
        ]
    },
    {
        name: "indent",
        presetValue: 1,
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
                activeIcon: "Right-to-left",
                action: "custom",
                isActive: editor => {
                    const attrs = editor.getAttributes("paragraph");
                    return attrs.dir === "rtl";
                },
                customAction: editor => {
                    const attrs = editor.getAttributes("paragraph");
                    const isRTL = attrs.dir === "rtl";
                    (editor.chain().focus() as any).setTextDirection(isRTL ? "ltr" : "rtl").run();
                }
            }
        ]
    },
    {
        name: "align",
        presetValue: 2,
        buttons: [
            {
                name: "alignLeft",
                title: "Align Left",
                icon: "Text-align-left",
                action: "command",
                command: "setTextAlign",
                attrs: { textAlign: "left" },
                isActive: editor => editor.isActive({ textAlign: "left" })
            },
            {
                name: "alignCenter",
                title: "Align Center",
                icon: "Text-align-center",
                action: "command",
                command: "setTextAlign",
                attrs: { textAlign: "center" },
                isActive: editor => editor.isActive({ textAlign: "center" })
            },
            {
                name: "alignRight",
                title: "Align Right",
                icon: "Text-align-right",
                action: "command",
                command: "setTextAlign",
                attrs: { textAlign: "right" },
                isActive: editor => editor.isActive({ textAlign: "right" })
            },
            {
                name: "alignJustify",
                title: "Align Justify",
                icon: "Text-align-justify",
                action: "command",
                command: "setTextAlign",
                attrs: { textAlign: "justify" },
                isActive: editor => editor.isActive({ textAlign: "justify" })
            }
        ]
    },
    {
        name: "fontColor",
        presetValue: 2,
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
        presetValue: 1,
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
        presetValue: 3,
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
        presetValue: 2,
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
        presetValue: 1,
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
        presetValue: 2,
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
        presetValue: 2,
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
        parentName: "tableBetter",
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
                name: "tableConfiguration",
                title: "Table Configuration",
                icon: "Table",
                action: "configurationDropdown",
                customAction: (editor: Editor) => {
                    // Configuration sections are created dynamically
                    return createTableConfigurationSections(editor);
                }
            },
            {
                name: "cellConfiguration",
                title: "Cell Configuration",
                icon: "Cell",
                action: "configurationDropdown",
                customAction: (editor: Editor) => {
                    // Configuration sections are created dynamically
                    return createCellConfigurationSections(editor);
                }
            }
        ]
    }
];

// Toolbar group custom configuration interface
export interface ToolbarGroupsConfig {
    history?: boolean;
    fontStyle?: boolean;
    fontScript?: boolean;
    list?: boolean;
    indent?: boolean;
    embed?: boolean;
    align?: boolean;
    code?: boolean;
    fontColor?: boolean;
    header?: boolean;
    view?: boolean;
    remove?: boolean;
    tableBetter?: boolean;
}

// Mapping from CtItemType to button names
const CT_ITEM_TO_BUTTON_MAP: Record<CtItemTypeEnum, string | null> = {
    separator: null, // Special case
    undo: "undo",
    redo: "redo",
    bold: "bold",
    italic: "italic",
    underline: "underline",
    strike: "strike",
    superScript: "superscript",
    subScript: "subscript",
    orderedList: "orderedList",
    bulletList: "bulletList",
    lowerAlphaList: null, // Not directly supported in TipTap
    checkList: "taskList",
    minIndent: "decreaseIndent",
    plusIndent: "increaseIndent",
    direction: "textDirection",
    link: "insertLink",
    image: "insertImage",
    video: "insertVideo",
    formula: null, // Not implemented in TipTap
    blockquote: "blockquote",
    code: "code",
    codeBlock: "codeBlock",
    viewCode: "codeView",
    align: "textAlign", // Left align is part of dropdown
    centerAlign: "textAlign", // Center align is part of dropdown
    rightAlign: "textAlign", // Right align is part of dropdown
    font: "fontFamily",
    size: "fontSize",
    color: "textColor",
    background: "backgroundColor",
    header: "textFormat",
    fullscreen: null, // Not implemented
    clean: "clearFormatting",
    tableBetter: "insertTable"
};

// Find button config by name across all toolbar groups
function findButtonByName(buttonName: string): ToolbarButtonConfig | null {
    for (const group of TOOLBAR_GROUPS) {
        const button = group.buttons.find(b => b.name === buttonName);
        if (button) {
            return button;
        }
    }
    return null;
}

// Build advanced custom toolbar from CtItemType list
export function buildAdvancedToolbar(advancedConfig: AdvancedConfigType[]): ToolbarGroupConfig[] {
    const groups: ToolbarGroupConfig[] = [];
    let currentGroup: ToolbarButtonConfig[] = [];

    for (const item of advancedConfig) {
        if (item.ctItemType === "separator") {
            // Create a new group when separator is encountered
            if (currentGroup.length > 0) {
                groups.push({
                    name: `custom-group-${groups.length}`,
                    presetValue: 1,
                    buttons: currentGroup
                });
                currentGroup = [];
            }
        } else {
            // Map CtItemType to button name and find the button config
            const buttonName = CT_ITEM_TO_BUTTON_MAP[item.ctItemType];
            if (buttonName) {
                const button = findButtonByName(buttonName);
                if (button) {
                    // Avoid duplicate buttons in the same group
                    if (!currentGroup.find(b => b.name === button.name)) {
                        currentGroup.push(button);
                    }
                }
            }
        }
    }

    // Add remaining buttons as final group
    if (currentGroup.length > 0) {
        groups.push({
            name: `custom-group-${groups.length}`,
            presetValue: 1,
            buttons: currentGroup
        });
    }

    return groups;
}

// Filter toolbar groups based on preset or custom configuration
export function getFilteredToolbarGroups(
    preset: PresetEnum,
    toolbarConfig?: ToolbarConfigEnum,
    customConfig?: ToolbarGroupsConfig,
    advancedConfig?: AdvancedConfigType[]
): ToolbarGroupConfig[] {
    if (preset === "custom") {
        // Advanced mode: build custom toolbar from advancedConfig list
        if (toolbarConfig === "advanced" && advancedConfig && advancedConfig.length > 0) {
            return buildAdvancedToolbar(advancedConfig);
        }

        // Basic mode: filter by individual boolean props
        return TOOLBAR_GROUPS.filter(group => {
            const key = group.name as keyof ToolbarGroupsConfig;
            return customConfig?.[key] !== false;
        });
    }

    // Filter by presetValue (groups without presetValue are always included)
    const maxPresetValue = preset === "basic" ? 1 : preset === "standard" ? 2 : 3;
    return TOOLBAR_GROUPS.filter(group => !group.presetValue || group.presetValue <= maxPresetValue);
}
