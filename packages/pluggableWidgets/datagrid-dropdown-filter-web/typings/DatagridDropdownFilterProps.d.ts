/**
 * This file was generated from DatagridDropdownFilter.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, DynamicValue, EditableValue, ListValue, ListAttributeValue, ListReferenceValue, ListReferenceSetValue } from "mendix";

export type BaseTypeEnum = "attr" | "ref";

export type AttrChoiceEnum = "auto" | "linked";

export interface FilterOptionsType {
    caption: DynamicValue<string>;
    value: DynamicValue<string>;
}

export type SelectedItemsStyleEnum = "text" | "boxes";

export type SelectionMethodEnum = "checkbox" | "rowClick";

export interface FilterOptionsPreviewType {
    caption: string;
    value: string;
}

export interface DatagridDropdownFilterContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    baseType: BaseTypeEnum;
    attrChoice: AttrChoiceEnum;
    attr: ListAttributeValue<string | boolean>;
    auto: boolean;
    filterOptions: FilterOptionsType[];
    ref?: ListReferenceValue | ListReferenceSetValue;
    refOptions?: ListValue;
    refCaption?: ListAttributeValue<string>;
    fetchOptionsLazy: boolean;
    defaultValue?: DynamicValue<string>;
    filterable: boolean;
    multiSelect: boolean;
    emptyOptionCaption?: DynamicValue<string>;
    clearable: boolean;
    selectedItemsStyle: SelectedItemsStyleEnum;
    selectionMethod: SelectionMethodEnum;
    valueAttribute?: EditableValue<string>;
    onChange?: ActionValue;
    ariaLabel?: DynamicValue<string>;
}

export interface DatagridDropdownFilterPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode: "design" | "xray" | "structure";
    translate: (text: string) => string;
    baseType: BaseTypeEnum;
    attrChoice: AttrChoiceEnum;
    attr: string;
    auto: boolean;
    filterOptions: FilterOptionsPreviewType[];
    ref: string;
    refOptions: {} | { caption: string } | { type: string } | null;
    refCaption: string;
    fetchOptionsLazy: boolean;
    defaultValue: string;
    filterable: boolean;
    multiSelect: boolean;
    emptyOptionCaption: string;
    clearable: boolean;
    selectedItemsStyle: SelectedItemsStyleEnum;
    selectionMethod: SelectionMethodEnum;
    valueAttribute: string;
    onChange: {} | null;
    ariaLabel: string;
}
