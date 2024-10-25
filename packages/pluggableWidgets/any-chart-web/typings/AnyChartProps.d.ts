/**
 * This file was generated from AnyChart.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { EditableValue, ReferenceValue, ReferenceSetValue } from "mendix";

export type DevModeEnum = "developer" | "advanced";

export interface AnyChartContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    dataStatic: string;
    dataAttribute?: EditableValue<string>;
    sampleData: string;
    devMode: DevModeEnum;
    layoutStatic: string;
    layoutAttribute?: EditableValue<string>;
    sampleLayout: string;
    configurationOptions: string;
    eventEntity?: ReferenceValue | ReferenceSetValue;
    eventDataAttribute?: EditableValue<string>;
    onClickMicroflow?: any;
    onClickNanoflow?: any;
    tooltipEntity?: any;
    tooltipMicroflow?: any;
    tooltipForm?: any;
}

export interface AnyChartPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode?: "design" | "xray" | "structure";
    dataStatic: string;
    dataAttribute: string;
    sampleData: string;
    devMode: DevModeEnum;
    layoutStatic: string;
    layoutAttribute: string;
    sampleLayout: string;
    configurationOptions: string;
    eventEntity: string;
    eventDataAttribute: string;
    onClickMicroflow: any;
    onClickNanoflow: any;
    tooltipEntity: any;
    tooltipMicroflow: any;
    tooltipForm: any;
}
