import Big from "big.js";
import { DynamicValue, ListValue, ListExpressionValue, ListAttributeValue, ActionValue } from "mendix";
import { Datum, PlotData } from "plotly.js";
import { MendixChartDataProps } from "../components/Chart";
declare type PlotChartDataPoints = {
    x: Datum[];
    y: Datum[];
    hovertext: string[] | undefined;
    hoverinfo: PlotData["hoverinfo"];
    name?: PlotData["name"];
};
export declare type PlotChartSeries = PlotChartDataPoints & MendixChartDataProps;
interface PlotDataSeries {
    dataSet: "static" | "dynamic";
    customSeriesOptions: string | undefined;
    groupByAttribute?: ListAttributeValue<string | boolean | Date | Big>;
    staticDataSource?: ListValue;
    dynamicDataSource?: ListValue;
    staticName?: DynamicValue<string>;
    dynamicName?: ListExpressionValue<string>;
    staticXAttribute?: ListAttributeValue<Date | Big | string>;
    dynamicXAttribute?: ListAttributeValue<Date | Big | string>;
    staticYAttribute?: ListAttributeValue<Date | Big | string>;
    dynamicYAttribute?: ListAttributeValue<Date | Big | string>;
    onClickAction?: ActionValue;
    staticTooltipHoverText?: ListExpressionValue<string>;
    dynamicTooltipHoverText?: ListExpressionValue<string>;
}
export declare type SeriesMapper<T> = (serie: T, dataPoints: PlotChartDataPoints) => Partial<PlotData>;
export declare function usePlotChartDataSeries<T extends PlotDataSeries>(
    series: T[],
    mapSerie: SeriesMapper<T>
): PlotChartSeries[] | null;
declare type AggregationTypeEnum =
    | "none"
    | "count"
    | "sum"
    | "avg"
    | "min"
    | "max"
    | "median"
    | "mode"
    | "first"
    | "last";
export declare function getPlotChartDataTransforms(
    aggregationType: AggregationTypeEnum,
    dataPoints: PlotChartDataPoints
): PlotData["transforms"];
export {};
//# sourceMappingURL=usePlotChartDataSeries.d.ts.map
