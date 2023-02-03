/**
 * This file was generated from Dropdown.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ComponentType, CSSProperties, ReactNode } from "react";
import { ActionValue, DynamicValue, EditableValue, ListValue, ReferenceValue, ReferenceSetValue } from "mendix";

export type TypeEnum = "enumeration" | "association" | "custom";

export type CustomCaptionEnum = "enumeration" | "association" | "custom";

export type TypeaheadEnum = "no" | "startsWith" | "contains";

export type OptionCaptionEnum = "textTemplate" | "custom";

export interface DropdownContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    type: TypeEnum;
    refValueObjects?: ListValue;
    enumAttribute?: EditableValue<string>;
    refValue?: ReferenceValue | ReferenceSetValue;
    customCaption: CustomCaptionEnum;
    emptyOptionText?: DynamicValue<string>;
    captionText?: DynamicValue<string>;
    typeahead: TypeaheadEnum;
    clearable: boolean;
    showLabel: boolean;
    labelCaption: DynamicValue<string>;
    optionCaption: OptionCaptionEnum;
    optionTextTemplate?: DynamicValue<string>;
    optionCustom?: ReactNode;
    onClickEvent?: ActionValue;
    onEnterEvent?: ActionValue;
    onLeaveEvent?: ActionValue;
    ariaRequired: boolean;
}

export interface DropdownPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    type: TypeEnum;
    refValueObjects: {} | { type: string } | null;
    enumAttribute: string;
    refValue: string;
    customCaption: CustomCaptionEnum;
    emptyOptionText: string;
    captionText: string;
    typeahead: TypeaheadEnum;
    clearable: boolean;
    showLabel: boolean;
    labelCaption: string;
    optionCaption: OptionCaptionEnum;
    optionTextTemplate: string;
    optionCustom: { widgetCount: number; renderer: ComponentType<{ caption?: string }> };
    onClickEvent: {} | null;
    onEnterEvent: {} | null;
    onLeaveEvent: {} | null;
    ariaRequired: boolean;
}
