/**
 * This file was generated from ColumnChart.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { DynamicValue, ListValue, ListActionValue, ListAttributeValue, ListExpressionValue } from "mendix";
import { Big } from "big.js";

export type DataSetEnum = "static" | "dynamic";

export type AggregationTypeEnum = "none" | "count" | "sum" | "avg" | "min" | "max" | "median" | "mode" | "first" | "last";

export interface SeriesType {
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
    staticTooltipHoverText?: ListExpressionValue<string>;
    dynamicTooltipHoverText?: ListExpressionValue<string>;
    staticBarColor?: ListExpressionValue<string>;
    dynamicBarColor?: ListExpressionValue<string>;
    staticOnClickAction?: ListActionValue;
    dynamicOnClickAction?: ListActionValue;
    customSeriesOptions: string;
}

export type GridLinesEnum = "none" | "horizontal" | "vertical" | "both";

export type BarmodeEnum = "group" | "stack";

export type WidthUnitEnum = "percentage" | "pixels";

export type HeightUnitEnum = "percentageOfWidth" | "pixels" | "percentageOfParent";

export interface SeriesPreviewType {
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
    staticTooltipHoverText: string;
    dynamicTooltipHoverText: string;
    staticBarColor: string;
    dynamicBarColor: string;
    staticOnClickAction: {} | null;
    dynamicOnClickAction: {} | null;
    customSeriesOptions: string;
}

export interface ColumnChartContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    series: SeriesType[];
    advancedOptions: boolean;
    developerMode: boolean;
    xAxisLabel?: DynamicValue<string>;
    yAxisLabel?: DynamicValue<string>;
    showLegend: boolean;
    gridLines: GridLinesEnum;
    barmode: BarmodeEnum;
    widthUnit: WidthUnitEnum;
    width: number;
    heightUnit: HeightUnitEnum;
    height: number;
    enableThemeConfig: boolean;
    customLayout: string;
    customConfigurations: string;
}

export interface ColumnChartPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    series: SeriesPreviewType[];
    advancedOptions: boolean;
    developerMode: boolean;
    xAxisLabel: string;
    yAxisLabel: string;
    showLegend: boolean;
    gridLines: GridLinesEnum;
    barmode: BarmodeEnum;
    widthUnit: WidthUnitEnum;
    width: number | null;
    heightUnit: HeightUnitEnum;
    height: number | null;
    enableThemeConfig: boolean;
    customLayout: string;
    customConfigurations: string;
}
