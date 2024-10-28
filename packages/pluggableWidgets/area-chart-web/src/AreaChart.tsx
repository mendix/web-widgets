import {
    ChartWidget,
    ChartWidgetProps,
    SeriesMapper,
    containerPropsEqual,
    getPlotChartDataTransforms,
    usePlotChartDataSeries
} from "@mendix/shared-charts/main";
import "@mendix/shared-charts/ui/Chart.scss";
import classNames from "classnames";
import { createElement, memo, ReactElement, useCallback } from "react";
import { AreaChartContainerProps, SeriesType } from "../typings/AreaChartProps";

const areaChartLayoutOptions: ChartWidgetProps["layoutOptions"] = {
    xaxis: {
        zeroline: true,
        fixedrange: true,
        gridcolor: "#d7d7d7",
        zerolinecolor: "#d7d7d7"
    },
    yaxis: {
        fixedrange: true,
        gridcolor: "#d7d7d7",
        zeroline: true,
        zerolinecolor: "#d7d7d7"
    }
};
const areaChartConfigOptions: ChartWidgetProps["configOptions"] = {
    responsive: true
};
const areaChartSeriesOptions: ChartWidgetProps["seriesOptions"] = {};

// disable eslint rule to have nice component name in component tree at devtools
// eslint-disable-next-line prefer-arrow-callback
export const AreaChart = memo(function AreaChart(props: AreaChartContainerProps): ReactElement {
    const mapSeries = useCallback<SeriesMapper<SeriesType>>((line, dataPoints, { getExpressionValue }) => {
        const lineColorExpression = line.dataSet === "static" ? line.staticLineColor : line.dynamicLineColor;
        const markerColorExpression = line.dataSet === "static" ? line.staticMarkerColor : line.dynamicMarkerColor;
        const fillColorExpression = line.dataSet === "static" ? line.staticFillColor : line.dynamicFillColor;
        return {
            type: "scatter",
            fill: "tonexty",
            fillcolor: fillColorExpression
                ? getExpressionValue<string>(fillColorExpression, dataPoints.dataSourceItems)
                : undefined,
            mode: line.lineStyle === "line" ? "lines" : "lines+markers",
            line: {
                shape: line.interpolation,
                color: lineColorExpression
                    ? getExpressionValue<string>(lineColorExpression, dataPoints.dataSourceItems)
                    : undefined
            },
            marker: {
                color: markerColorExpression
                    ? getExpressionValue<string>(markerColorExpression, dataPoints.dataSourceItems)
                    : undefined
            },
            transforms: getPlotChartDataTransforms(line.aggregationType, dataPoints)
        };
    }, []);

    const series = usePlotChartDataSeries(props.series, mapSeries);

    return (
        <ChartWidget
            type="AreaChart"
            className={classNames("widget-line-chart", props.class)}
            data={series ?? []}
            width={props.width}
            widthUnit={props.widthUnit}
            height={props.height}
            heightUnit={props.heightUnit}
            showLegend={props.showLegend}
            xAxisLabel={props.xAxisLabel?.value}
            yAxisLabel={props.yAxisLabel?.value}
            gridLinesMode={props.gridLines}
            customLayout={props.customLayout}
            customConfig={props.customConfigurations}
            layoutOptions={areaChartLayoutOptions}
            configOptions={areaChartConfigOptions}
            seriesOptions={areaChartSeriesOptions}
            enableThemeConfig={props.enableThemeConfig}
            playground={props.playground}
        />
    );
}, containerPropsEqual);
