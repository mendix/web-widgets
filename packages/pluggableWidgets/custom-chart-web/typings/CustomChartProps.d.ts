/**
 * This file was generated from CustomChart.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { EditableValue } from "mendix";

export type DevModeEnum = "developer" | "advanced";

export type WidthUnitEnum = "percentage" | "pixels";

export type HeightUnitEnum = "percentageOfWidth" | "pixels" | "percentageOfParent";

export interface CustomChartContainerProps {
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
    widthUnit: WidthUnitEnum;
    width: number;
    heightUnit: HeightUnitEnum;
    height: number;
}

export interface CustomChartPreviewProps {
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
    widthUnit: WidthUnitEnum;
    width: number | null;
    heightUnit: HeightUnitEnum;
    height: number | null;
}
