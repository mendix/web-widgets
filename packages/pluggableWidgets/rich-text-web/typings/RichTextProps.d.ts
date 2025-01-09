/**
 * This file was generated from RichText.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ActionValue, EditableValue } from "mendix";

export type PresetEnum = "basic" | "standard" | "full" | "custom";

export type ToolbarLocationEnum = "auto" | "top" | "bottom" | "hide";

export type ReadOnlyStyleEnum = "text" | "bordered" | "readPanel";

export type WidthUnitEnum = "pixels" | "percentage";

export type HeightUnitEnum = "percentageOfWidth" | "pixels" | "percentageOfParent" | "percentageOfView";

export type MinHeightUnitEnum = "none" | "pixels" | "percentageOfParent" | "percentageOfView";

export type MaxHeightUnitEnum = "none" | "pixels" | "percentageOfParent" | "percentageOfView";

export type OverflowYEnum = "auto" | "scroll" | "hidden";

export type OnChangeTypeEnum = "onLeave" | "onDataChange";

export type ToolbarConfigEnum = "basic" | "advanced";

export type CtItemTypeEnum = "separator" | "undo" | "redo" | "bold" | "italic" | "underline" | "strike" | "superScript" | "subScript" | "orderedList" | "bulletList" | "lowerAlphaList" | "checkList" | "minIndent" | "plusIndent" | "direction" | "link" | "image" | "video" | "formula" | "blockquote" | "codeBlock" | "viewCode" | "align" | "centerAlign" | "rightAlign" | "font" | "color" | "background" | "header" | "clean";

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
    enableStatusBar: boolean;
    preset: PresetEnum;
    toolbarLocation: ToolbarLocationEnum;
    readOnlyStyle: ReadOnlyStyleEnum;
    widthUnit: WidthUnitEnum;
    width: number;
    heightUnit: HeightUnitEnum;
    height: number;
    minHeightUnit: MinHeightUnitEnum;
    minHeight: number;
    maxHeightUnit: MaxHeightUnitEnum;
    maxHeight: number;
    OverflowY: OverflowYEnum;
    onChange?: ActionValue;
    onFocus?: ActionValue;
    onBlur?: ActionValue;
    onLoad?: ActionValue;
    onChangeType: OnChangeTypeEnum;
    spellCheck: boolean;
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
    renderMode?: "design" | "xray" | "structure";
    stringAttribute: string;
    enableStatusBar: boolean;
    preset: PresetEnum;
    toolbarLocation: ToolbarLocationEnum;
    readOnlyStyle: ReadOnlyStyleEnum;
    widthUnit: WidthUnitEnum;
    width: number | null;
    heightUnit: HeightUnitEnum;
    height: number | null;
    minHeightUnit: MinHeightUnitEnum;
    minHeight: number | null;
    maxHeightUnit: MaxHeightUnitEnum;
    maxHeight: number | null;
    OverflowY: OverflowYEnum;
    onChange: {} | null;
    onFocus: {} | null;
    onBlur: {} | null;
    onLoad: {} | null;
    onChangeType: OnChangeTypeEnum;
    spellCheck: boolean;
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
