/**
 * This file was generated from Dropdown.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ComponentType, CSSProperties, ReactNode } from "react";
import { ActionValue, DynamicValue, ListValue, ReferenceValue, ReferenceSetValue } from "mendix";

export type TypeaheadEnum = "typeaheadNo" | "typeaheadStartWith" | "typeaheadContains";

export type TypeEnum = "typeEnumeration" | "typeAssociation" | "typeCustom";

export type CustomCaptionEnum = "captionEnumeration" | "captionAssociation" | "captionCustom";

export type OptionCaptionEnum = "textTemplate" | "custom";

export interface DropdownContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    captionText: DynamicValue<string>;
    emptyOptionText: DynamicValue<string>;
    typeahead: TypeaheadEnum;
    clearable: boolean;
    showLabel: boolean;
    labelCaption: DynamicValue<string>;
    type: TypeEnum;
    customAttribute?: ReferenceValue | ReferenceSetValue;
    customCaption: CustomCaptionEnum;
    dataSource?: ListValue;
    customName: string;
    optionCaption: OptionCaptionEnum;
    optionTextTemplate: DynamicValue<string>;
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
    captionText: string;
    emptyOptionText: string;
    typeahead: TypeaheadEnum;
    clearable: boolean;
    showLabel: boolean;
    labelCaption: string;
    type: TypeEnum;
    customAttribute: string;
    customCaption: CustomCaptionEnum;
    dataSource: {} | { type: string } | null;
    customName: string;
    optionCaption: OptionCaptionEnum;
    optionTextTemplate: string;
    optionCustom: { widgetCount: number; renderer: ComponentType<{ caption?: string }> };
    onClickEvent: {} | null;
    onEnterEvent: {} | null;
    onLeaveEvent: {} | null;
    ariaRequired: boolean;
}
