/**
 * This file was generated from DatagridDateFilter.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, AttributeMetaData, DynamicValue, EditableValue } from "mendix";

export type AttrChoiceEnum = "auto" | "linked";

export interface AttributesType {
    attribute: AttributeMetaData<Date>;
}

export type DefaultFilterEnum = "between" | "greater" | "greaterEqual" | "equal" | "notEqual" | "smaller" | "smallerEqual" | "empty" | "notEmpty";

export interface AttributesPreviewType {
    attribute: string;
}

export interface DatagridDateFilterContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    attrChoice: AttrChoiceEnum;
    attributes: AttributesType[];
    defaultValue?: DynamicValue<Date>;
    defaultStartDate?: DynamicValue<Date>;
    defaultEndDate?: DynamicValue<Date>;
    defaultFilter: DefaultFilterEnum;
    placeholder?: DynamicValue<string>;
    adjustable: boolean;
    valueAttribute?: EditableValue<Date>;
    startDateAttribute?: EditableValue<Date>;
    endDateAttribute?: EditableValue<Date>;
    onChange?: ActionValue;
    screenReaderButtonCaption?: DynamicValue<string>;
    screenReaderCalendarCaption?: DynamicValue<string>;
    screenReaderInputCaption?: DynamicValue<string>;
}

export interface DatagridDateFilterPreviewProps {
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
    attrChoice: AttrChoiceEnum;
    attributes: AttributesPreviewType[];
    defaultValue: string;
    defaultStartDate: string;
    defaultEndDate: string;
    defaultFilter: DefaultFilterEnum;
    placeholder: string;
    adjustable: boolean;
    valueAttribute: string;
    startDateAttribute: string;
    endDateAttribute: string;
    onChange: {} | null;
    screenReaderButtonCaption: string;
    screenReaderCalendarCaption: string;
    screenReaderInputCaption: string;
}
