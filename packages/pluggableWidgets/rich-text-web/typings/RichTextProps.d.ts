/**
 * This file was generated from RichText.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ActionValue, EditableValue } from "mendix";

export type PresetEnum = "basic" | "standard" | "full" | "custom";

export type ToolbarModeEnum = "floating" | "sliding" | "scrolling" | "wrap";

export type ToolbarLocationEnum = "auto" | "top" | "bottom" | "inline";

export type WidthUnitEnum = "percentage" | "pixels";

export type HeightUnitEnum = "percentageOfWidth" | "pixels" | "percentageOfParent";

export interface RichTextContainerProps {
    name: string;
    tabIndex?: number;
    id: string;
    stringAttribute: EditableValue<string>;
    preset: PresetEnum;
    toolbarMode: ToolbarModeEnum;
    enableMenuBar: boolean;
    toolbarLocation: ToolbarLocationEnum;
    enableStatusBar: boolean;
    spellCheck: boolean;
    widthUnit: WidthUnitEnum;
    width: number;
    heightUnit: HeightUnitEnum;
    height: number;
    onKeyPress?: ActionValue;
    onChange?: ActionValue;
    onBlur?: ActionValue;
    plugins: string;
    toolbar: string;
    menubar: string;
}

export interface RichTextPreviewProps {
    readOnly: boolean;
    stringAttribute: string;
    preset: PresetEnum;
    toolbarMode: ToolbarModeEnum;
    enableMenuBar: boolean;
    toolbarLocation: ToolbarLocationEnum;
    enableStatusBar: boolean;
    spellCheck: boolean;
    widthUnit: WidthUnitEnum;
    width: number | null;
    heightUnit: HeightUnitEnum;
    height: number | null;
    onKeyPress: {} | null;
    onChange: {} | null;
    onBlur: {} | null;
    plugins: string;
    toolbar: string;
    menubar: string;
}
