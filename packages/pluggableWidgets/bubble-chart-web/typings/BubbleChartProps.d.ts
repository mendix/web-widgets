/**
 * This file was generated from BubbleChart.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ComponentType, CSSProperties, ReactNode } from "react";
import { DynamicValue, ListValue, ListActionValue, ListAttributeValue, ListExpressionValue } from "mendix";
import { Big } from "big.js";

export type DataSetEnum = "static" | "dynamic";

export type AggregationTypeEnum = "none" | "count" | "sum" | "avg" | "min" | "max" | "median" | "mode" | "first" | "last";

export interface LinesType {
    dataSet: DataSetEnum;
    staticDataSource?: ListValue;
    dynamicDataSource?: ListValue;
    groupByAttribute?: ListAttributeValue<string | boolean | Date | Big>;
    staticName?: DynamicValue<string>;
    dynamicName?: ListExpressionValue<string>;
    staticXAttribute?: ListAttributeValue<string | Date | Big>;
    dynamicXAttribute?: ListAttributeValue<string | Date | Big>;
    staticYAttribute?: ListAttributeValue<string | Date | Big>;
    dynamicYAttribute?: ListAttributeValue<string | Date | Big>;
    aggregationType: AggregationTypeEnum;
    staticSizeAttribute?: ListAttributeValue<Big>;
    dynamicSizeAttribute?: ListAttributeValue<Big>;
    autosize: boolean;
    sizeref: number;
    staticTooltipHoverText?: ListExpressionValue<string>;
    dynamicTooltipHoverText?: ListExpressionValue<string>;
    staticMarkerColor?: ListExpressionValue<string>;
    dynamicMarkerColor?: ListExpressionValue<string>;
    staticOnClickAction?: ListActionValue;
    dynamicOnClickAction?: ListActionValue;
    customSeriesOptions: string;
}

export type GridLinesEnum = "none" | "horizontal" | "vertical" | "both";

export type WidthUnitEnum = "percentage" | "pixels";

export type HeightUnitEnum = "percentageOfWidth" | "pixels" | "percentageOfParent";

export interface LinesPreviewType {
    dataSet: DataSetEnum;
    staticDataSource: {} | { caption: string } | { type: string } | null;
    dynamicDataSource: {} | { caption: string } | { type: string } | null;
    groupByAttribute: string;
    staticName: string;
    dynamicName: string;
    staticXAttribute: string;
    dynamicXAttribute: string;
    staticYAttribute: string;
    dynamicYAttribute: string;
    aggregationType: AggregationTypeEnum;
    staticSizeAttribute: string;
    dynamicSizeAttribute: string;
    autosize: boolean;
    sizeref: number | null;
    staticTooltipHoverText: string;
    dynamicTooltipHoverText: string;
    staticMarkerColor: string;
    dynamicMarkerColor: string;
    staticOnClickAction: {} | null;
    dynamicOnClickAction: {} | null;
    customSeriesOptions: string;
}

export interface BubbleChartContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    lines: LinesType[];
    enableAdvancedOptions: boolean;
    showPlaygroundSlot: boolean;
    playground?: ReactNode;
    xAxisLabel?: DynamicValue<string>;
    yAxisLabel?: DynamicValue<string>;
    showLegend: boolean;
    gridLines: GridLinesEnum;
    widthUnit: WidthUnitEnum;
    width: number;
    heightUnit: HeightUnitEnum;
    height: number;
    enableThemeConfig: boolean;
    customLayout: string;
    customConfigurations: string;
}

export interface BubbleChartPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode?: "design" | "xray" | "structure";
    lines: LinesPreviewType[];
    enableAdvancedOptions: boolean;
    showPlaygroundSlot: boolean;
    playground: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    xAxisLabel: string;
    yAxisLabel: string;
    showLegend: boolean;
    gridLines: GridLinesEnum;
    widthUnit: WidthUnitEnum;
    width: number | null;
    heightUnit: HeightUnitEnum;
    height: number | null;
    enableThemeConfig: boolean;
    customLayout: string;
    customConfigurations: string;
}
