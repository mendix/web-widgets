import { Editor } from "@tiptap/react";
import { createContext } from "react";
import { createTableConfigurationSections, createCellConfigurationSections } from "./helpers/configurationHelpers";
import { AddCustomFontsToFontFamilyDropdown, FONT_LIST, FONT_SIZE_LIST } from "./helpers/fontHelpers";
import {
    PresetEnum,
    ToolbarConfigEnum,
    CtItemTypeEnum,
    AdvancedConfigType,
    CustomFontsType
} from "../../../typings/RichTextProps";
import { TranslateFn } from "../../utils/i18n";

export type ToolbarActionType =
    | "toggle"
    | "command"
    | "custom"
    | "heading"
    | "dropdown"
    | "splitButton"
    | "tableGrid"
    | "colorPicker"
    | "dialog"
    | "codeView"
    | "configurationDropdown";

export type ColorPickerCommand =
    "textColor" | "textHighlight" | "cellBackground" | "tableBackground" | "tableBorderColor";

export type DialogCommand = "insertImage" | "insertVideo" | "insertLink";

export type TableGridCommand = "insertTable";

export type DropdownCommand = ColorPickerCommand | DialogCommand | TableGridCommand;

export interface ToolbarDropdownOption {
    label: string;
    value: string;
    command: string;
    attrs?: Record<string, any>;
    icon?: string;
}

export interface ConfigurationSection {
    id: string;
    label: string;
    type: "colorPicker" | "dropdown" | "numberInput" | "textInput";
    getCurrentValue?: () => string | number | null;
    onChange: (value: string) => void;
    onClear?: () => void;
    options?: Array<{ value: string; label: string }>;
    defaultColor?: string;
    min?: number;
    max?: number;
    step?: number;
    placeholder?: string;
    unit?: string;
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
    customAction?: (editor: Editor, t: TranslateFn) => void | ConfigurationSection[];
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
                title: "toolbar.undo",
                icon: "Undo",
                action: "command",
                command: "undo",
                canExecute: editor => editor.can().chain().focus().undo().run()
            },
            {
                name: "redo",
                title: "toolbar.redo",
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
                title: "toolbar.bold",
                icon: "Text-bold",
                action: "toggle",
                command: "toggleBold",
                isActive: editor => editor.isActive("bold"),
                canExecute: editor => editor.can().chain().focus().toggleBold().run()
            },
            {
                name: "italic",
                title: "toolbar.italic",
                icon: "Text-italic",
                action: "toggle",
                command: "toggleItalic",
                isActive: editor => editor.isActive("italic"),
                canExecute: editor => editor.can().chain().focus().toggleItalic().run()
            },
            {
                name: "underline",
                title: "toolbar.underline",
                icon: "Text-underline",
                action: "toggle",
                command: "toggleUnderline",
                isActive: editor => editor.isActive("underline"),
                canExecute: editor => editor.can().chain().focus().toggleUnderline().run()
            },
            {
                name: "strike",
                title: "toolbar.strike",
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
                title: "toolbar.superscript",
                icon: "Text-superscript",
                action: "toggle",
                command: "toggleSuperscript",
                isActive: editor => editor.isActive("superscript"),
                canExecute: editor => editor.can().chain().focus().toggleSuperscript().run()
            },
            {
                name: "subscript",
                title: "toolbar.subscript",
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
                name: "bulletList",
                title: "toolbar.bulletList",
                icon: "List-bullets",
                action: "toggle",
                command: "toggleBulletList",
                isActive: editor => editor.isActive("bulletList")
            },
            {
                name: "orderedList",
                title: "toolbar.orderedList",
                icon: "List-numbers",
                action: "splitButton",
                command: "toggleOrderedList",
                isActive: editor => editor.isActive("orderedList"),
                dropdownOptions: [
                    {
                        label: "1, 2, 3",
                        value: "decimal",
                        command: "setOrderedListStyle",
                        attrs: { styleType: null },
                        icon: "List-numbers"
                    },
                    {
                        label: "a, b, c",
                        value: "lower-alpha",
                        command: "setOrderedListStyle",
                        attrs: { styleType: "lower-alpha" },
                        icon: "List-lower-alpha"
                    },
                    {
                        label: "i, ii, iii",
                        value: "lower-roman",
                        command: "setOrderedListStyle",
                        attrs: { styleType: "lower-roman" },
                        icon: "List-roman"
                    }
                ],
                getCurrentValue: editor => {
                    if (!editor.isActive("orderedList")) return "";
                    const attrs = editor.getAttributes("orderedList");
                    return attrs.listStyleType || "decimal";
                }
            },
            {
                name: "taskList",
                title: "toolbar.taskList",
                icon: "List-checklist",
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
                title: "toolbar.decreaseIndent",
                icon: "Text-indent-right",
                action: "command",
                command: "decreaseIndent"
            },
            {
                name: "increaseIndent",
                title: "toolbar.increaseIndent",
                icon: "Text-indent-left",
                action: "command",
                command: "increaseIndent"
            },
            {
                name: "textDirection",
                title: "toolbar.textDirection",
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
                name: "leftAlign",
                title: "toolbar.leftAlign",
                icon: "Text-align-left",
                action: "command",
                command: "setTextAlign",
                attrs: { textAlign: "left" },
                isActive: editor => editor.isActive({ textAlign: "left" })
            },
            {
                name: "centerAlign",
                title: "toolbar.centerAlign",
                icon: "Text-align-center",
                action: "command",
                command: "setTextAlign",
                attrs: { textAlign: "center" },
                isActive: editor => editor.isActive({ textAlign: "center" })
            },
            {
                name: "rightAlign",
                title: "toolbar.rightAlign",
                icon: "Text-align-right",
                action: "command",
                command: "setTextAlign",
                attrs: { textAlign: "right" },
                isActive: editor => editor.isActive({ textAlign: "right" })
            },
            {
                name: "justifyAlign",
                title: "toolbar.justifyAlign",
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
                title: "toolbar.fontFamily",
                icon: "Text-font",
                action: "dropdown",
                dropdownOptions: FONT_LIST.map(font => ({
                    label: font.description,
                    value: font.value,
                    command: "setFontFamily",
                    attrs: {
                        fontFamily: font.style,
                        fontValue: font.value
                    }
                })),
                getCurrentValue: editor => {
                    const { fontValue, fontFamily } = editor.getAttributes("textStyle");

                    // Use fontValue if available (new format)
                    if (fontValue) {
                        return fontValue;
                    }

                    // Fallback for legacy content without data-font-value
                    if (fontFamily) {
                        // Derive from fontFamily: "arial, helvetica, ..." → "arial"
                        const firstFont = fontFamily.split(",")[0].trim();
                        return firstFont.replace(/['"]/g, "").toLowerCase().replace(/\s+/g, "-");
                    }

                    return "";
                }
            },
            {
                name: "fontSize",
                title: "toolbar.fontSize",
                icon: "Text-size",
                action: "dropdown",
                dropdownOptions: FONT_SIZE_LIST.map(size => ({
                    label: size,
                    value: size,
                    command: "setFontSize",
                    attrs: { fontSize: size }
                })),
                getCurrentValue: editor => {
                    const { fontSize } = editor.getAttributes("textStyle");
                    return fontSize || "14px";
                }
            },
            {
                name: "textColor",
                title: "toolbar.textColor",
                icon: "Text-color",
                action: "colorPicker",
                command: "textColor"
            },
            {
                name: "backgroundColor",
                title: "toolbar.backgroundColor",
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
                title: "toolbar.insertLink",
                icon: "Hyperlink",
                action: "dialog",
                command: "insertLink"
            },
            {
                name: "insertImage",
                title: "toolbar.insertImage",
                icon: "Image",
                action: "dialog",
                command: "insertImage"
            },
            {
                name: "insertVideo",
                title: "toolbar.insertVideo",
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
                title: "toolbar.textFormat",
                icon: "Arrow-down",
                action: "dropdown",
                dropdownOptions: [
                    { label: "format.paragraph", value: "paragraph", command: "setParagraph" },
                    { label: "format.heading1", value: "h1", command: "toggleHeading", attrs: { level: 1 } },
                    { label: "format.heading2", value: "h2", command: "toggleHeading", attrs: { level: 2 } },
                    { label: "format.heading3", value: "h3", command: "toggleHeading", attrs: { level: 3 } },
                    { label: "format.heading4", value: "h4", command: "toggleHeading", attrs: { level: 4 } },
                    { label: "format.heading5", value: "h5", command: "toggleHeading", attrs: { level: 5 } },
                    { label: "format.heading6", value: "h6", command: "toggleHeading", attrs: { level: 6 } }
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
                title: "toolbar.blockquote",
                icon: "Blockquote",
                action: "toggle",
                command: "toggleBlockquote",
                isActive: editor => editor.isActive("blockquote")
            },
            {
                name: "code",
                title: "toolbar.code",
                icon: "Inline-code",
                action: "toggle",
                command: "toggleCode",
                isActive: editor => editor.isActive("code"),
                canExecute: editor => editor.can().chain().focus().toggleCode().run()
            },
            {
                name: "codeBlock",
                title: "toolbar.codeBlock",
                icon: "View-edit-code",
                action: "toggle",
                command: "toggleCodeBlock",
                isActive: editor => editor.isActive("codeBlock")
            },
            {
                name: "codeView",
                title: "toolbar.codeView",
                icon: "Code-block",
                action: "codeView"
            }
        ]
    },
    {
        name: "remove",
        presetValue: 1,
        buttons: [
            {
                name: "clearFormatting",
                title: "toolbar.clearFormatting",
                icon: "Erase",
                action: "command",
                command: "unsetAllMarks"
            }
        ]
    },
    {
        name: "tableBetter",
        presetValue: 2,
        buttons: [
            {
                name: "insertTable",
                title: "toolbar.insertTable",
                icon: "Table",
                action: "tableGrid"
            }
        ]
    },
    {
        name: "view",
        presetValue: 2,
        buttons: [
            {
                name: "fullscreen",
                title: "toolbar.fullscreen",
                icon: "Expand",
                action: "command",
                command: "toggleFullscreen",
                isActive: () => document.querySelector(".widget-rich-text")?.classList.contains("fullscreen") || false
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
                name: "tableConfiguration",
                title: "toolbar.tableConfiguration",
                icon: "Table-configuration",
                action: "configurationDropdown",
                customAction: (editor: Editor, t: TranslateFn) => {
                    // Configuration sections are created dynamically
                    return createTableConfigurationSections(editor, t);
                }
            },
            {
                name: "cellConfiguration",
                title: "toolbar.cellConfiguration",
                icon: "Cell",
                action: "configurationDropdown",
                customAction: (editor: Editor, t: TranslateFn) => {
                    // Configuration sections are created dynamically
                    return createCellConfigurationSections(editor, t);
                }
            },
            {
                name: "mergeCells",
                title: "toolbar.mergeCells",
                icon: "Merge",
                action: "command",
                command: "mergeCells",
                canExecute: editor => editor.can().mergeCells()
            },
            {
                name: "splitCell",
                title: "toolbar.splitCell",
                icon: "Split-cell",
                action: "command",
                command: "splitCell",
                canExecute: editor => editor.can().splitCell()
            },
            {
                name: "deleteTable",
                title: "toolbar.deleteTable",
                icon: "Delete-table",
                action: "command",
                command: "deleteTable",
                canExecute: editor => editor.can().deleteTable()
            },
            {
                name: "addRowAfter",
                title: "toolbar.addRowAfter",
                icon: "Insert-row-after",
                action: "command",
                command: "addRowAfter",
                canExecute: editor => editor.can().addRowAfter()
            },
            {
                name: "addRowBefore",
                title: "toolbar.addRowBefore",
                icon: "Insert-row-before",
                action: "command",
                command: "addRowBefore",
                canExecute: editor => editor.can().addRowBefore()
            },
            {
                name: "deleteRow",
                title: "toolbar.deleteRow",
                icon: "Delete-row",
                action: "command",
                command: "deleteRow",
                canExecute: editor => editor.can().deleteRow()
            },
            {
                name: "addColumnAfter",
                title: "toolbar.addColumnAfter",
                icon: "Insert-column-after",
                action: "command",
                command: "addColumnAfter",
                canExecute: editor => editor.can().addColumnAfter()
            },
            {
                name: "addColumnBefore",
                title: "toolbar.addColumnBefore",
                icon: "Insert-column-before",
                action: "command",
                command: "addColumnBefore",
                canExecute: editor => editor.can().addColumnBefore()
            },
            {
                name: "deleteColumn",
                title: "toolbar.deleteColumn",
                icon: "Delete-column",
                action: "command",
                command: "deleteColumn",
                canExecute: editor => editor.can().deleteColumn()
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
    leftAlign: "leftAlign",
    centerAlign: "centerAlign",
    rightAlign: "rightAlign",
    justifyAlign: "justifyAlign",
    font: "fontFamily",
    size: "fontSize",
    color: "textColor",
    background: "backgroundColor",
    header: "header",
    fullscreen: "fullscreen",
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

/**
 * Build advanced custom toolbar from CtItemType list, optionally enhanced with custom fonts
 * @param advancedConfig - Advanced toolbar configuration
 * @param customFonts - Optional user-provided custom fonts to add to font family dropdown
 * @returns Built and enhanced toolbar groups
 */
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

/**
 * Enhances toolbar groups by merging custom fonts into the fontFamilySelect dropdown
 * @param groups - Toolbar groups to enhance
 * @param customFonts - User-provided custom fonts to add
 * @returns Enhanced toolbar groups with merged and sorted fonts
 */
function enhancedToolbarGroups(groups: ToolbarGroupConfig[], customFonts?: CustomFontsType[]): ToolbarGroupConfig[] {
    // Enhance with custom fonts if provided
    if (!customFonts || customFonts.length === 0) {
        return groups;
    }
    // Map over groups and enhance fontFamilySelect button
    return groups.map(group => ({
        ...group,
        buttons: group.buttons.map(button => {
            switch (button.name) {
                case "fontFamily":
                    return AddCustomFontsToFontFamilyDropdown(button, customFonts);
                default:
                    return button;
            }
        })
    }));
}

/**
 * Filter toolbar groups based on preset or custom configuration, and optionally enhance with custom fonts
 * @param preset - Toolbar preset (basic, standard, full, custom)
 * @param toolbarConfig - Toolbar configuration mode
 * @param customConfig - Custom toolbar group configuration
 * @param advancedConfig - Advanced toolbar configuration
 * @param customFonts - Optional user-provided custom fonts to add to font family dropdown
 * @returns Filtered and enhanced toolbar groups
 */
export function getFilteredToolbarGroups(
    preset: PresetEnum,
    toolbarConfig?: ToolbarConfigEnum,
    customConfig?: ToolbarGroupsConfig,
    advancedConfig?: AdvancedConfigType[],
    customFonts?: CustomFontsType[]
): ToolbarGroupConfig[] {
    let filteredGroups: ToolbarGroupConfig[];

    if (preset === "custom") {
        // Advanced mode: build custom toolbar from advancedConfig list
        if (toolbarConfig === "advanced" && advancedConfig && advancedConfig.length > 0) {
            filteredGroups = buildAdvancedToolbar(advancedConfig);
        } else {
            // Basic mode: filter by individual boolean props
            filteredGroups = TOOLBAR_GROUPS.filter(group => {
                const key = group.name as keyof ToolbarGroupsConfig;
                return customConfig?.[key] !== false;
            });
        }
    } else {
        // Filter by presetValue (groups without presetValue are always included)
        const maxPresetValue = preset === "basic" ? 1 : preset === "standard" ? 2 : 3;
        filteredGroups = TOOLBAR_GROUPS.filter(group => !group.presetValue || group.presetValue <= maxPresetValue);
    }

    return enhancedToolbarGroups(filteredGroups, customFonts);
}
