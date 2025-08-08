/**
 * This file was generated from RichText.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ComponentType, ReactNode } from "react";
import { ActionValue, EditableValue, ListValue } from "mendix";

export type PresetEnum = "basic" | "standard" | "full" | "custom";

export type ToolbarLocationEnum = "auto" | "top" | "bottom" | "hide";

export type ReadOnlyStyleEnum = "text" | "bordered" | "readPanel";

export type FormOrientationEnum = "horizontal" | "vertical";

export type WidthUnitEnum = "pixels" | "percentage";

export type HeightUnitEnum = "percentageOfWidth" | "pixels" | "percentageOfParent" | "percentageOfView";

export type MinHeightUnitEnum = "none" | "pixels" | "percentageOfParent" | "percentageOfView";

export type MaxHeightUnitEnum = "none" | "pixels" | "percentageOfParent" | "percentageOfView";

export type OverflowYEnum = "auto" | "scroll" | "hidden";

export type OnChangeTypeEnum = "onLeave" | "onDataChange";

export interface CustomFontsType {
    fontName: string;
    fontStyle: string;
}

export type ToolbarConfigEnum = "basic" | "advanced";

export type CtItemTypeEnum = "separator" | "undo" | "redo" | "bold" | "italic" | "underline" | "strike" | "superScript" | "subScript" | "orderedList" | "bulletList" | "lowerAlphaList" | "checkList" | "minIndent" | "plusIndent" | "direction" | "link" | "image" | "video" | "formula" | "blockquote" | "code" | "codeBlock" | "viewCode" | "align" | "centerAlign" | "rightAlign" | "font" | "size" | "color" | "background" | "header" | "fullscreen" | "clean" | "tableBetter";

export interface AdvancedConfigType {
    ctItemType: CtItemTypeEnum;
}

export interface CustomFontsPreviewType {
    fontName: string;
    fontStyle: string;
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
    formOrientation: FormOrientationEnum;
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
    customFonts: CustomFontsType[];
    imageSource?: ListValue;
    imageSourceContent?: ReactNode;
    enableDefaultUpload: boolean;
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
    view: boolean;
    remove: boolean;
    tableBetter: boolean;
    advancedConfig: AdvancedConfigType[];
}

export interface RichTextPreviewProps {
    readOnly: boolean;
    renderMode: "design" | "xray" | "structure";
    translate: (text: string) => string;
    stringAttribute: string;
    enableStatusBar: boolean;
    preset: PresetEnum;
    toolbarLocation: ToolbarLocationEnum;
    readOnlyStyle: ReadOnlyStyleEnum;
    formOrientation: FormOrientationEnum;
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
    customFonts: CustomFontsPreviewType[];
    imageSource: {} | { caption: string } | { type: string } | null;
    imageSourceContent: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    enableDefaultUpload: boolean;
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
    view: boolean;
    remove: boolean;
    tableBetter: boolean;
    advancedConfig: AdvancedConfigPreviewType[];
}
