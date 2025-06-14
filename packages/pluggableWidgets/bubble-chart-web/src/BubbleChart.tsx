import { ChartWidget, ChartWidgetProps, traceEqual, usePlotChartDataSeries } from "@mendix/shared-charts/main";
import "@mendix/shared-charts/ui/Chart.scss";
import { defaultEqual, flatEqual } from "@mendix/widget-plugin-platform/utils/flatEqual";
import Big from "big.js";
import classNames from "classnames";
import { ReactElement, createElement, memo, useCallback } from "react";
import { BubbleChartContainerProps, LinesType } from "../typings/BubbleChartProps";
import { calculateSizeRef } from "./utils";

const bubbleChartLayoutOptions: ChartWidgetProps["layoutOptions"] = {
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
const bubbleChartConfigOptions: ChartWidgetProps["configOptions"] = {
    responsive: true
};
const bubbleChartSeriesOptions: ChartWidgetProps["seriesOptions"] = {};

export const BubbleChart = memo(
    // disable eslint rule to have nice component name in component tree at devtools

    function BubbleChart(props: BubbleChartContainerProps): ReactElement {
        const getSizes = (line: LinesType): number[] => {
            const sizes: number[] = [];
            let dataset: LinesType["staticDataSource"] | LinesType["dynamicDataSource"] | undefined;
            let sizeAttribute: LinesType["staticSizeAttribute"] | LinesType["dynamicSizeAttribute"];
            if (line.dataSet === "static") {
                dataset = line.staticDataSource;
                sizeAttribute = line.staticSizeAttribute;
            } else {
                dataset = line.dynamicDataSource;
                sizeAttribute = line.dynamicSizeAttribute;
            }
            if (dataset?.items) {
                for (const item of dataset.items) {
                    const size = sizeAttribute?.get(item);
                    const value = size?.value instanceof Big ? Number(size.value.toString()) : size?.value;
                    if (value) {
                        sizes.push(Big(value).toNumber());
                    }
                }
            }
            return sizes;
        };

        const chartBubbles = usePlotChartDataSeries(
            props.lines,
            useCallback((line, dataPoints, { getExpressionValue }) => {
                const size = getSizes(line);
                const markerOptions = calculateSizeRef(
                    line,
                    { size },
                    {
                        width: props.width,
                        widthUnit: props.widthUnit,
                        height: props.height,
                        heightUnit: props.heightUnit
                    }
                );
                const markerColorExpression =
                    line.dataSet === "static" ? line.staticMarkerColor : line.dynamicMarkerColor;

                return {
                    type: "scatter",
                    mode: "markers",
                    marker: {
                        color: markerColorExpression
                            ? getExpressionValue<string>(markerColorExpression, dataPoints.dataSourceItems)
                            : undefined,
                        symbol: ["circle"],
                        size,
                        ...markerOptions
                    }
                };
            }, [])
        );
        return (
            <ChartWidget
                type="BubbleChart"
                className={classNames("widget-bubble-chart", props.class)}
                data={chartBubbles ?? []}
                width={props.width}
                widthUnit={props.widthUnit}
                height={props.height}
                heightUnit={props.heightUnit}
                showLegend={props.showLegend}
                xAxisLabel={props.xAxisLabel?.value}
                yAxisLabel={props.yAxisLabel?.value}
                gridLinesMode={props.gridLines}
                playground={props.playground}
                customLayout={props.customLayout}
                customConfig={props.customConfigurations}
                layoutOptions={bubbleChartLayoutOptions}
                configOptions={bubbleChartConfigOptions}
                seriesOptions={bubbleChartSeriesOptions}
                enableThemeConfig={props.enableThemeConfig}
            />
        );
    },
    (prev, next) =>
        flatEqual(prev, next, (oldProp, newProp, propName) => {
            return propName === "lines" ? flatEqual(oldProp, newProp, traceEqual) : defaultEqual(oldProp, newProp);
        })
);
