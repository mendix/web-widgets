/**
 * This file was generated from HeatMap.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ComponentType, CSSProperties, ReactNode } from "react";
import { DynamicValue, ListValue, ListActionValue, ListAttributeValue, ListExpressionValue, SelectionSingleValue } from "mendix";
import { Big } from "big.js";

export type HorizontalSortOrderEnum = "asc" | "desc";

export type VerticalSortOrderEnum = "asc" | "desc";

export type GridLinesEnum = "none" | "horizontal" | "vertical" | "both";

export interface ScaleColorsType {
    valuePercentage: number;
    colour: string;
}

export type WidthUnitEnum = "percentage" | "pixels";

export type HeightUnitEnum = "percentageOfWidth" | "pixels" | "percentageOfParent";

export interface ScaleColorsPreviewType {
    valuePercentage: number | null;
    colour: string;
}

export interface HeatMapContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    seriesDataSource: ListValue;
    seriesValueAttribute: ListAttributeValue<Big>;
    seriesItemSelection?: SelectionSingleValue;
    horizontalAxisAttribute?: ListAttributeValue<string>;
    horizontalSortAttribute?: ListAttributeValue<Big | string | Date>;
    horizontalSortOrder: HorizontalSortOrderEnum;
    verticalAxisAttribute?: ListAttributeValue<string>;
    verticalSortAttribute?: ListAttributeValue<Big | string | Date>;
    verticalSortOrder: VerticalSortOrderEnum;
    enableAdvancedOptions: boolean;
    showPlaygroundSlot: boolean;
    playground?: ReactNode;
    xAxisLabel?: DynamicValue<string>;
    yAxisLabel?: DynamicValue<string>;
    showScale: boolean;
    gridLines: GridLinesEnum;
    scaleColors: ScaleColorsType[];
    smoothColor: boolean;
    showValues: boolean;
    valuesColor: string;
    widthUnit: WidthUnitEnum;
    width: number;
    heightUnit: HeightUnitEnum;
    height: number;
    onClickAction?: ListActionValue;
    tooltipHoverText?: ListExpressionValue<string>;
    enableThemeConfig: boolean;
    customLayout: string;
    customConfigurations: string;
    customSeriesOptions: string;
}

export interface HeatMapPreviewProps {
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
    seriesDataSource: {} | { caption: string } | { type: string } | null;
    seriesValueAttribute: string;
    seriesItemSelection: "None" | "Single";
    horizontalAxisAttribute: string;
    horizontalSortAttribute: string;
    horizontalSortOrder: HorizontalSortOrderEnum;
    verticalAxisAttribute: string;
    verticalSortAttribute: string;
    verticalSortOrder: VerticalSortOrderEnum;
    enableAdvancedOptions: boolean;
    showPlaygroundSlot: boolean;
    playground: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    xAxisLabel: string;
    yAxisLabel: string;
    showScale: boolean;
    gridLines: GridLinesEnum;
    scaleColors: ScaleColorsPreviewType[];
    smoothColor: boolean;
    showValues: boolean;
    valuesColor: string;
    widthUnit: WidthUnitEnum;
    width: number | null;
    heightUnit: HeightUnitEnum;
    height: number | null;
    onClickAction: {} | null;
    tooltipHoverText: string;
    enableThemeConfig: boolean;
    customLayout: string;
    customConfigurations: string;
    customSeriesOptions: string;
}
