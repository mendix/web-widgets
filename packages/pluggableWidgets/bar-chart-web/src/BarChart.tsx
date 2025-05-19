import { ChartWidget, ChartWidgetProps, containerPropsEqual, usePlotChartDataSeries } from "@mendix/shared-charts/main";
import "@mendix/shared-charts/ui/Chart.scss";
import classNames from "classnames";
import { ReactElement, createElement, memo, useCallback, useMemo } from "react";

import { BarChartContainerProps } from "../typings/BarChartProps";

const barChartLayoutOptions: ChartWidgetProps["layoutOptions"] = {
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
        zerolinecolor: "#d7d7d7",
        rangemode: "tozero"
    }
};

const barChartConfigOptions: ChartWidgetProps["configOptions"] = {
    responsive: true
};

const barChartSeriesOptions: ChartWidgetProps["seriesOptions"] = {
    type: "bar"
};

// disable eslint rule to have nice component name in component tree at devtools

export const BarChart = memo(function BarChart(props: BarChartContainerProps): ReactElement | null {
    const layoutOptions = useMemo(
        () => ({
            ...barChartLayoutOptions,
            barmode: props.barmode
        }),
        [props.barmode]
    );

    const series = usePlotChartDataSeries(
        props.series,
        useCallback((dataSeries, dataPoints, { getExpressionValue }) => {
            const barColorExpression =
                dataSeries.dataSet === "static" ? dataSeries.staticBarColor : dataSeries.dynamicBarColor;

            return {
                type: "bar",
                orientation: "h",
                marker: {
                    color: barColorExpression
                        ? getExpressionValue<string>(barColorExpression, dataPoints.dataSourceItems)
                        : undefined
                }
            };
        }, [])
    );

    return (
        <ChartWidget
            type="BarChart"
            className={classNames("widget-bar-chart", props.class)}
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
            layoutOptions={layoutOptions}
            configOptions={barChartConfigOptions}
            seriesOptions={barChartSeriesOptions}
            enableThemeConfig={props.enableThemeConfig}
            playground={props.playground}
        />
    );
}, containerPropsEqual);
