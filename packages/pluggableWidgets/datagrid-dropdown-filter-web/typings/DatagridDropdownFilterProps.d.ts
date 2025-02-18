/**
 * This file was generated from DatagridDropdownFilter.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, DynamicValue, EditableValue } from "mendix";

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
    auto: boolean;
    defaultValue?: DynamicValue<string>;
    filterOptions: FilterOptionsType[];
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
    renderMode?: "design" | "xray" | "structure";
    auto: boolean;
    defaultValue: string;
    filterOptions: FilterOptionsPreviewType[];
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
