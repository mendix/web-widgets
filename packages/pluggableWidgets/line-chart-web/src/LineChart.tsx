import classNames from "classnames";
import { createElement, ReactElement, useCallback, memo } from "react";
import { ChartWidget, ChartWidgetProps, traceEqual } from "@mendix/shared-charts";
import { getPlotChartDataTransforms, usePlotChartDataSeries } from "@mendix/shared-charts/hooks";
import { flatEqual, defaultEqual } from "@mendix/widget-plugin-platform/utils/flatEqual";
import { LineChartContainerProps } from "../typings/LineChartProps";

const lineChartLayoutOptions: ChartWidgetProps["layoutOptions"] = {
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
const lineChartConfigOptions: ChartWidgetProps["configOptions"] = {
    responsive: true
};
const lineChartSeriesOptions: ChartWidgetProps["seriesOptions"] = {};

export const LineChart = memo(
    // disable eslint rule to have nice component name in component tree at devtools
    // eslint-disable-next-line prefer-arrow-callback
    function LineChart(props: LineChartContainerProps): ReactElement | null {
        const chartLines = usePlotChartDataSeries(
            props.lines,
            useCallback((line, dataPoints, { getExpressionValue }) => {
                const lineColorExpression = line.dataSet === "static" ? line.staticLineColor : line.dynamicLineColor;
                const markerColorExpression =
                    line.dataSet === "static" ? line.staticMarkerColor : line.dynamicMarkerColor;

                return {
                    type: "scatter",
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
            }, [])
        );

        return (
            <ChartWidget
                type="LineChart"
                className={classNames("widget-line-chart", props.class)}
                data={chartLines ?? []}
                width={props.width}
                widthUnit={props.widthUnit}
                height={props.height}
                heightUnit={props.heightUnit}
                showLegend={props.showLegend}
                xAxisLabel={props.xAxisLabel?.value}
                yAxisLabel={props.yAxisLabel?.value}
                gridLinesMode={props.gridLines}
                showSidebarEditor={props.enableDeveloperMode}
                customLayout={props.customLayout}
                customConfig={props.customConfigurations}
                layoutOptions={lineChartLayoutOptions}
                configOptions={lineChartConfigOptions}
                seriesOptions={lineChartSeriesOptions}
                enableThemeConfig={props.enableThemeConfig}
            />
        );
    },
    (prev, next) =>
        flatEqual(prev, next, (oldProp, newProp, propName) => {
            return propName === "lines" ? flatEqual(oldProp, newProp, traceEqual) : defaultEqual(oldProp, newProp);
        })
);
