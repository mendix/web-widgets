/**
 * This file was generated from DropdownSort.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { DynamicValue } from "mendix";

export interface DropdownSortContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
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
    renderMode?: "design" | "xray" | "structure";
    emptyOptionCaption: string;
    screenReaderButtonCaption: string;
    screenReaderInputCaption: string;
}
