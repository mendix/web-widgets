/**
 * This file was generated from DatagridNumberFilter.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, AttributeMetaData, DynamicValue, EditableValue } from "mendix";
import { Big } from "big.js";

export type AttrChoiceEnum = "auto" | "linked";

export interface AttributesType {
    attribute: AttributeMetaData<Big>;
}

export type DefaultFilterEnum = "greater" | "greaterEqual" | "equal" | "notEqual" | "smaller" | "smallerEqual" | "empty" | "notEmpty";

export interface AttributesPreviewType {
    attribute: string;
}

export interface DatagridNumberFilterContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    attrChoice: AttrChoiceEnum;
    attributes: AttributesType[];
    defaultValue?: DynamicValue<Big>;
    defaultFilter: DefaultFilterEnum;
    placeholder?: DynamicValue<string>;
    adjustable: boolean;
    delay: number;
    valueAttribute?: EditableValue<Big>;
    onChange?: ActionValue;
    screenReaderButtonCaption?: DynamicValue<string>;
    screenReaderInputCaption?: DynamicValue<string>;
}

export interface DatagridNumberFilterPreviewProps {
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
    defaultFilter: DefaultFilterEnum;
    placeholder: string;
    adjustable: boolean;
    delay: number | null;
    valueAttribute: string;
    onChange: {} | null;
    screenReaderButtonCaption: string;
    screenReaderInputCaption: string;
}
