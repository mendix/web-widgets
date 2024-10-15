import {
    ChartWidget,
    ChartWidgetProps,
    getPlotChartDataTransforms,
    usePlotChartDataSeries,
    traceEqual
} from "@mendix/shared-charts/main";
import "@mendix/shared-charts/ui/Chart.scss";
import { defaultEqual, flatEqual } from "@mendix/widget-plugin-platform/utils/flatEqual";
import classNames from "classnames";
import { ReactElement, createElement, memo, useCallback, useMemo } from "react";
import { TimeSeriesContainerProps } from "../typings/TimeSeriesProps";

const createTimeSeriesChartLayoutOptions = (
    showRangeSlider: TimeSeriesContainerProps["showRangeSlider"],
    yAxisRangeMode: TimeSeriesContainerProps["yAxisRangeMode"]
): ChartWidgetProps["layoutOptions"] => ({
    font: {
        color: "#555",
        size: 12
    },
    legend: {
        font: {
            family: "Open Sans",
            size: 14,
            color: "#555"
        }
    },
    xaxis: {
        type: "date",
        autorange: true,
        gridcolor: "#d7d7d7",
        zerolinecolor: "#d7d7d7",
        zeroline: true,
        rangeslider: {
            visible: showRangeSlider,
            borderwidth: 1,
            bordercolor: "#d7d7d7"
        }
    },
    yaxis: {
        fixedrange: true,
        gridcolor: "#d7d7d7",
        zeroline: true,
        zerolinecolor: "#d7d7d7",
        rangemode: yAxisRangeMode || "tozero"
    }
});

const timeSeriesChartConfigOptions: ChartWidgetProps["configOptions"] = {
    responsive: true
};

const timeSeriesChartSeriesOptions: ChartWidgetProps["seriesOptions"] = {
    type: "scatter",
    hoverinfo: "none"
};

export const TimeSeries = memo(
    // disable eslint rule to have nice component name in component tree at devtools
    // eslint-disable-next-line prefer-arrow-callback
    function TimeSeries(props: TimeSeriesContainerProps): ReactElement | null {
        const chartLines = usePlotChartDataSeries(
            props.lines,
            useCallback(
                (line, dataPoints) => ({
                    mode: line.lineStyle === "line" ? "lines" : "lines+markers",
                    fill: line.enableFillArea ? "tonexty" : "none",
                    fillcolor: line.fillColor?.value,
                    line: {
                        shape: line.interpolation,
                        color: line.lineColor?.value
                    },
                    marker: {
                        color: line.markerColor?.value
                    },
                    transforms: getPlotChartDataTransforms(line.aggregationType, dataPoints)
                }),
                []
            )
        );

        const timeSeriesLayout = useMemo<ChartWidgetProps["layoutOptions"]>(
            () => createTimeSeriesChartLayoutOptions(props.showRangeSlider, props.yAxisRangeMode),
            [props.showRangeSlider, props.yAxisRangeMode]
        );

        return (
            <ChartWidget
                type="TimeSeries"
                className={classNames("widget-time-series-chart", props.class)}
                data={chartLines ?? []}
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
                layoutOptions={timeSeriesLayout}
                configOptions={timeSeriesChartConfigOptions}
                seriesOptions={timeSeriesChartSeriesOptions}
                enableThemeConfig={props.enableThemeConfig}
                playground={props.playground}
            />
        );
    },
    (prevProps, nextProps) =>
        flatEqual(prevProps, nextProps, (oldProp, newProp, propName) => {
            return propName === "lines" ? flatEqual(oldProp, newProp, traceEqual) : defaultEqual(oldProp, newProp);
        })
);
