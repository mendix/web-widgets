/**
 * This file was generated from PieChart.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ComponentType, CSSProperties, ReactNode } from "react";
import { ListValue, ListActionValue, ListAttributeValue, ListExpressionValue, SelectionSingleValue } from "mendix";
import { Big } from "big.js";

export type SeriesSortOrderEnum = "asc" | "desc";

export type WidthUnitEnum = "percentage" | "pixels";

export type HeightUnitEnum = "percentageOfWidth" | "pixels" | "percentageOfParent";

export interface PieChartContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    seriesDataSource: ListValue;
    seriesName: ListExpressionValue<string>;
    seriesValueAttribute: ListAttributeValue<Big>;
    seriesSortAttribute?: ListAttributeValue<string | boolean | Date | Big>;
    seriesSortOrder: SeriesSortOrderEnum;
    seriesColorAttribute?: ListExpressionValue<string>;
    seriesItemSelection?: SelectionSingleValue;
    enableAdvancedOptions: boolean;
    showPlaygroundSlot: boolean;
    playground?: ReactNode;
    showLegend: boolean;
    holeRadius: number;
    tooltipHoverText?: ListExpressionValue<string>;
    widthUnit: WidthUnitEnum;
    width: number;
    heightUnit: HeightUnitEnum;
    height: number;
    onClickAction?: ListActionValue;
    enableThemeConfig: boolean;
    customLayout: string;
    customConfigurations: string;
    customSeriesOptions: string;
}

export interface PieChartPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode?: "design" | "xray" | "structure";
    seriesDataSource: {} | { caption: string } | { type: string } | null;
    seriesName: string;
    seriesValueAttribute: string;
    seriesSortAttribute: string;
    seriesSortOrder: SeriesSortOrderEnum;
    seriesColorAttribute: string;
    seriesItemSelection: "None" | "Single";
    enableAdvancedOptions: boolean;
    showPlaygroundSlot: boolean;
    playground: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    showLegend: boolean;
    holeRadius: number | null;
    tooltipHoverText: string;
    widthUnit: WidthUnitEnum;
    width: number | null;
    heightUnit: HeightUnitEnum;
    height: number | null;
    onClickAction: {} | null;
    enableThemeConfig: boolean;
    customLayout: string;
    customConfigurations: string;
    customSeriesOptions: string;
}
