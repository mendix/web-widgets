/**
 * This file was generated from Localize.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { DynamicValue } from "mendix";
import { Big } from "big.js";

export type ComponentEnum = "span" | "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export type ExpTypeEnum = "date" | "str" | "num";

export interface FormatParamsType {
    name: string;
    expType: ExpTypeEnum;
    str: DynamicValue<string>;
    int: DynamicValue<Big>;
    dec: DynamicValue<Big>;
    date: DynamicValue<Date>;
}

export interface FormatParamsPreviewType {
    name: string;
    expType: ExpTypeEnum;
    str: string;
    int: string;
    dec: string;
    date: string;
}

export interface LocalizeContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    tKey: string;
    component: ComponentEnum;
    formatParams: FormatParamsType[];
}

export interface LocalizePreviewProps {
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
    tKey: string;
    component: ComponentEnum;
    formatParams: FormatParamsPreviewType[];
}
