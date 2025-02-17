/**
 * This file was generated from CustomChart.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ComponentType, CSSProperties, ReactNode } from "react";
import { ActionValue, EditableValue } from "mendix";

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
    showPlaygroundSlot: boolean;
    playground?: ReactNode;
    layoutStatic: string;
    layoutAttribute?: EditableValue<string>;
    sampleLayout: string;
    configurationOptions: string;
    widthUnit: WidthUnitEnum;
    width: number;
    heightUnit: HeightUnitEnum;
    height: number;
    onClick?: ActionValue;
    eventDataAttribute?: EditableValue<string>;
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
    showPlaygroundSlot: boolean;
    playground: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    layoutStatic: string;
    layoutAttribute: string;
    sampleLayout: string;
    configurationOptions: string;
    widthUnit: WidthUnitEnum;
    width: number | null;
    heightUnit: HeightUnitEnum;
    height: number | null;
    onClick: {} | null;
    eventDataAttribute: string;
}
