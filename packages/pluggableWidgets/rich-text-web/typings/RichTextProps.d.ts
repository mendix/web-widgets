/**
 * This file was generated from RichText.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ActionValue, EditableValue } from "mendix";

export type PresetEnum = "basic" | "standard" | "full" | "custom";

export type ToolbarLocationEnum = "top" | "bottom";

export type ReadOnlyStyleEnum = "text" | "bordered" | "readPanel";

export type WidthUnitEnum = "percentage" | "pixels";

export type HeightUnitEnum = "percentageOfWidth" | "pixels" | "percentageOfParent";

export type OnChangeTypeEnum = "onLeave" | "onDataChange";

export type ToolbarConfigEnum = "basic" | "advanced";

export type CtItemTypeEnum = "separator" | "undo" | "redo" | "bold" | "italic" | "underline" | "strike" | "superScript" | "subScript" | "orderedList" | "bulletList" | "lowerAlphaList" | "checkList" | "minIndent" | "plusIndent" | "direction" | "link" | "image" | "video" | "formula" | "blockquote" | "codeBlock" | "align" | "centerAlign" | "rightAlign" | "font" | "color" | "background" | "header" | "clean";

export interface AdvancedConfigType {
    ctItemType: CtItemTypeEnum;
}

export interface AdvancedConfigPreviewType {
    ctItemType: CtItemTypeEnum;
}

export interface RichTextContainerProps {
    name: string;
    tabIndex?: number;
    id: string;
    stringAttribute: EditableValue<string>;
    preset: PresetEnum;
    toolbarLocation: ToolbarLocationEnum;
    readOnlyStyle: ReadOnlyStyleEnum;
    widthUnit: WidthUnitEnum;
    width: number;
    heightUnit: HeightUnitEnum;
    height: number;
    minHeight: number;
    onChange?: ActionValue;
    onFocus?: ActionValue;
    onBlur?: ActionValue;
    onChangeType: OnChangeTypeEnum;
    toolbarConfig: ToolbarConfigEnum;
    history: boolean;
    fontStyle: boolean;
    fontScript: boolean;
    list: boolean;
    indent: boolean;
    embed: boolean;
    align: boolean;
    code: boolean;
    fontColor: boolean;
    header: boolean;
    remove: boolean;
    advancedConfig: AdvancedConfigType[];
}

export interface RichTextPreviewProps {
    readOnly: boolean;
    stringAttribute: string;
    preset: PresetEnum;
    toolbarLocation: ToolbarLocationEnum;
    readOnlyStyle: ReadOnlyStyleEnum;
    widthUnit: WidthUnitEnum;
    width: number | null;
    heightUnit: HeightUnitEnum;
    height: number | null;
    minHeight: number | null;
    onChange: {} | null;
    onFocus: {} | null;
    onBlur: {} | null;
    onChangeType: OnChangeTypeEnum;
    toolbarConfig: ToolbarConfigEnum;
    history: boolean;
    fontStyle: boolean;
    fontScript: boolean;
    list: boolean;
    indent: boolean;
    embed: boolean;
    align: boolean;
    code: boolean;
    fontColor: boolean;
    header: boolean;
    remove: boolean;
    advancedConfig: AdvancedConfigPreviewType[];
}
