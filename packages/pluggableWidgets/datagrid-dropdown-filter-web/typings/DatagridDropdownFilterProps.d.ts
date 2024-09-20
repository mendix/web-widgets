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
    advanced: boolean;
    defaultValue?: DynamicValue<string>;
    filterOptions: FilterOptionsType[];
    emptyOptionCaption?: DynamicValue<string>;
    multiSelect: boolean;
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
    auto: boolean;
    advanced: boolean;
    defaultValue: string;
    filterOptions: FilterOptionsPreviewType[];
    emptyOptionCaption: string;
    multiSelect: boolean;
    valueAttribute: string;
    onChange: {} | null;
    ariaLabel: string;
}
