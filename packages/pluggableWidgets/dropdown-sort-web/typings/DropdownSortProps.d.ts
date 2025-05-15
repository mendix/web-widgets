/**
 * This file was generated from DropdownSort.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { AttributeMetaData, DynamicValue } from "mendix";
import { Big } from "big.js";

export interface AttributesType {
    attribute: AttributeMetaData<Big | string | Date | boolean>;
    caption: DynamicValue<string>;
}

export interface AttributesPreviewType {
    attribute: string;
    caption: string;
}

export interface DropdownSortContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    attributes: AttributesType[];
    emptyOptionCaption?: DynamicValue<string>;
    screenReaderButtonCaption?: DynamicValue<string>;
    screenReaderInputCaption?: DynamicValue<string>;
}

export interface DropdownSortPreviewProps {
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
    attributes: AttributesPreviewType[];
    emptyOptionCaption: string;
    screenReaderButtonCaption: string;
    screenReaderInputCaption: string;
}
