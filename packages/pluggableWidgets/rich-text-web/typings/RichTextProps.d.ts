/**
 * This file was generated from RichText.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ActionValue, DynamicValue, EditableValue } from "mendix";

export type MenubarModeEnum = "hide" | "basic" | "full" | "custom";

export type PresetEnum = "basic" | "standard" | "full" | "custom";

export type ToolbarModeEnum = "sliding" | "floating" | "scrolling" | "wrap";

export type ToolbarLocationEnum = "auto" | "top" | "bottom" | "inline";

export type WidthUnitEnum = "percentage" | "pixels";

export type HeightUnitEnum = "percentageOfWidth" | "pixels" | "percentageOfParent";

export type ResizeEnum = "false" | "true" | "both";

export type ToolbarConfigEnum = "basic" | "advanced";

export type CtItemTypeEnum = "separator" | "aligncenter" | "alignjustify" | "alignleft" | "alignnone" | "alignright" | "blockquote" | "backcolor" | "blocks" | "bold" | "copy" | "cut" | "fontfamily" | "fontsize" | "forecolor" | "hr" | "indent" | "italic" | "lineheight" | "newdocument" | "outdent" | "paste" | "pastetext" | "print" | "redo" | "remove" | "removeformat" | "selectall" | "strikethrough" | "subscript" | "superscript" | "underline" | "undo" | "visualaid" | "accordion" | "code" | "anchor" | "charmap" | "codesample" | "ltr" | "rtl" | "emoticons" | "fullscreen" | "help" | "image" | "insertdatetime" | "link" | "openlink" | "unlink" | "bullist" | "numlist" | "media" | "pagebreak" | "preview" | "searchreplace" | "table" | "tabledelete" | "tableinsertdialog" | "visualblocks" | "visualchars" | "wordcount";

export interface AdvancedConfigType {
    ctItemType: CtItemTypeEnum;
}

export type MenubarConfigEnum = "basic" | "advanced";

export type MenubarItemTypeEnum = "file" | "edit" | "insert" | "view" | "format" | "table" | "tools" | "help";

export interface AdvancedMenubarConfigType {
    menubarItemType: MenubarItemTypeEnum;
}

export interface AdvancedConfigPreviewType {
    ctItemType: CtItemTypeEnum;
}

export interface AdvancedMenubarConfigPreviewType {
    menubarItemType: MenubarItemTypeEnum;
}

export interface RichTextContainerProps {
    name: string;
    tabIndex?: number;
    id: string;
    stringAttribute: EditableValue<string>;
    menubarMode: MenubarModeEnum;
    enableStatusBar: boolean;
    preset: PresetEnum;
    toolbarMode: ToolbarModeEnum;
    toolbarLocation: ToolbarLocationEnum;
    widthUnit: WidthUnitEnum;
    width: number;
    heightUnit: HeightUnitEnum;
    height: number;
    onFocus?: ActionValue;
    onBlur?: ActionValue;
    extended_valid_elements?: DynamicValue<string>;
    spellCheck: boolean;
    highlight_on_focus: boolean;
    resize: ResizeEnum;
    toolbarConfig: ToolbarConfigEnum;
    basicstyle: boolean;
    extendedstyle: boolean;
    textalign: boolean;
    clipboard: boolean;
    fontstyle: boolean;
    paragraph: boolean;
    document: boolean;
    history: boolean;
    accordion: boolean;
    code: boolean;
    anchor: boolean;
    direction: boolean;
    link: boolean;
    list: boolean;
    preview: boolean;
    table: boolean;
    visualaid: boolean;
    media: boolean;
    util: boolean;
    emoticon: boolean;
    remove: boolean;
    advancedConfig: AdvancedConfigType[];
    menubarConfig: MenubarConfigEnum;
    fileMenubar: boolean;
    editMenubar: boolean;
    insertMenubar: boolean;
    viewMenubar: boolean;
    formatMenubar: boolean;
    tableMenubar: boolean;
    toolsMenubar: boolean;
    helpMenubar: boolean;
    advancedMenubarConfig: AdvancedMenubarConfigType[];
}

export interface RichTextPreviewProps {
    readOnly: boolean;
    stringAttribute: string;
    menubarMode: MenubarModeEnum;
    enableStatusBar: boolean;
    preset: PresetEnum;
    toolbarMode: ToolbarModeEnum;
    toolbarLocation: ToolbarLocationEnum;
    widthUnit: WidthUnitEnum;
    width: number | null;
    heightUnit: HeightUnitEnum;
    height: number | null;
    onFocus: {} | null;
    onBlur: {} | null;
    extended_valid_elements: string;
    spellCheck: boolean;
    highlight_on_focus: boolean;
    resize: ResizeEnum;
    toolbarConfig: ToolbarConfigEnum;
    basicstyle: boolean;
    extendedstyle: boolean;
    textalign: boolean;
    clipboard: boolean;
    fontstyle: boolean;
    paragraph: boolean;
    document: boolean;
    history: boolean;
    accordion: boolean;
    code: boolean;
    anchor: boolean;
    direction: boolean;
    link: boolean;
    list: boolean;
    preview: boolean;
    table: boolean;
    visualaid: boolean;
    media: boolean;
    util: boolean;
    emoticon: boolean;
    remove: boolean;
    advancedConfig: AdvancedConfigPreviewType[];
    menubarConfig: MenubarConfigEnum;
    fileMenubar: boolean;
    editMenubar: boolean;
    insertMenubar: boolean;
    viewMenubar: boolean;
    formatMenubar: boolean;
    tableMenubar: boolean;
    toolsMenubar: boolean;
    helpMenubar: boolean;
    advancedMenubarConfig: AdvancedMenubarConfigPreviewType[];
}
