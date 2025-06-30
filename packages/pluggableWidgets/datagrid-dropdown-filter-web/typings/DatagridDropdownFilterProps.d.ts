/**
 * This file was generated from DatagridDropdownFilter.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, AssociationMetaData, AttributeMetaData, DynamicValue, EditableValue, ListValue, ListAttributeValue, ListExpressionValue } from "mendix";

export type BaseTypeEnum = "attr" | "ref";

export type AttrChoiceEnum = "auto" | "linked";

export interface FilterOptionsType {
    caption: DynamicValue<string>;
    value: DynamicValue<string>;
}

export type RefCaptionSourceEnum = "attr" | "exp";

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
    attr: AttributeMetaData<string | boolean>;
    auto: boolean;
    filterOptions: FilterOptionsType[];
    refEntity: AssociationMetaData;
    refOptions?: ListValue;
    refCaptionSource: RefCaptionSourceEnum;
    refCaption?: ListAttributeValue<string>;
    refCaptionExp?: ListExpressionValue<string>;
    refSearchAttr?: ListAttributeValue<string>;
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
    emptySelectionCaption?: DynamicValue<string>;
    filterInputPlaceholderCaption?: DynamicValue<string>;
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
    refEntity: string;
    refOptions: {} | { caption: string } | { type: string } | null;
    refCaptionSource: RefCaptionSourceEnum;
    refCaption: string;
    refCaptionExp: string;
    refSearchAttr: string;
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
    emptySelectionCaption: string;
    filterInputPlaceholderCaption: string;
}
