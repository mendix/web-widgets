import Big from "big.js";
import { ObjectItem, DynamicValue, ListValue, ListExpressionValue, ListAttributeValue, ActionValue } from "mendix";
import { useEffect, useState } from "react";
import { ensure } from "@mendix/pluggable-widgets-tools";
import { Datum, PlotData } from "plotly.js";
import { executeAction } from "@mendix/pluggable-widgets-commons";
import { MendixChartDataProps } from "../components/Chart";

type PlotChartDataPoints = {
    x: Datum[];
    y: Datum[];
    hovertext: string[] | undefined;
    hoverinfo: PlotData["hoverinfo"];
    // We want this optional.
    name?: PlotData["name"];
};

interface DataSourceItemGroup {
    groupByAttributeValue: string | boolean | Date | Big;
    dynamicNameValue?: string;
    dynamicCustomLineStyleValue?: string;
    items: ObjectItem[];
}

export type PlotChartSeries = PlotChartDataPoints & MendixChartDataProps;

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

export type SeriesMapper<T> = (serie: T, dataPoints: PlotChartDataPoints) => Partial<PlotData>;

export function usePlotChartDataSeries<T extends PlotDataSeries>(
    series: T[],
    mapSerie: SeriesMapper<T>
): PlotChartSeries[] | null {
    const [chartSeries, setChartSeries] = useState<PlotChartSeries[] | null>(null);

    useEffect(() => {
        const loadedSeries = series
            .map(element => {
                const singleSeriesLoader = element.dataSet === "static" ? loadStaticSeries : loadDynamicSeries;
                return singleSeriesLoader(element, mapSerie);
            })
            .filter((element): element is PlotChartSeries | PlotChartSeries[] => Boolean(element))
            .flat();
        setChartSeries(loadedSeries.length === 0 ? null : loadedSeries);
    }, [series, mapSerie]);

    return chartSeries;
}

function createActionHandlers({
    onClickAction
}: Pick<PlotDataSeries, "onClickAction">): Pick<PlotChartSeries, "onClick"> {
    return {
        onClick: onClickAction ? () => executeAction(onClickAction) : undefined
    };
}

function loadStaticSeries(series: PlotDataSeries, mapSerie: SeriesMapper<PlotDataSeries>): PlotChartSeries | null {
    const { staticName, dataSet, customSeriesOptions, onClickAction } = series;

    if (dataSet !== "static") {
        throw Error("Expected series to be static");
    }

    const dataPoints = extractDataPoints(series, staticName?.value);

    if (!dataPoints) {
        return null;
    }

    return {
        ...createActionHandlers({ onClickAction }),
        ...mapSerie(series, dataPoints),
        ...dataPoints,
        customSeriesOptions
    };
}

function loadDynamicSeries(series: PlotDataSeries, mapSerie: SeriesMapper<PlotDataSeries>): PlotChartSeries[] | null {
    const { dataSet, customSeriesOptions, onClickAction } = series;

    if (dataSet !== "dynamic") {
        throw Error("Expected series to be dynamic");
    }

    const dataSourceItemGroups = groupDataSourceItems(series);

    if (!dataSourceItemGroups) {
        return null;
    }

    const loadedSeries = dataSourceItemGroups
        .map(itemGroup => {
            const dataPoints = extractDataPoints(series, itemGroup.dynamicNameValue, itemGroup.items);

            if (!dataPoints) {
                return null;
            }

            return {
                ...createActionHandlers({ onClickAction }),
                ...mapSerie(series, dataPoints),
                ...dataPoints,
                customSeriesOptions
            };
        })
        .filter((element): element is PlotChartSeries => Boolean(element));

    return loadedSeries;
}

function groupDataSourceItems(series: PlotDataSeries): DataSourceItemGroup[] | null {
    const { dynamicDataSource, dynamicName, groupByAttribute, dataSet } = series;

    if (dataSet !== "dynamic") {
        throw Error("Expected series to be dynamic");
    }

    const dataSource = ensure(dynamicDataSource);

    if (!dataSource.items) {
        return null;
    }

    const dataSourceItemGroupsResult: DataSourceItemGroup[] = [];

    for (const item of dataSource.items) {
        const groupByAttributeValue = ensure(groupByAttribute).get(item);

        if (groupByAttributeValue.status === "loading") {
            return null;
        }

        const groupValue = groupByAttributeValue.value ?? "";

        let group = dataSourceItemGroupsResult.find(group => {
            if (groupValue instanceof Date && group.groupByAttributeValue instanceof Date) {
                return group.groupByAttributeValue.getTime() === groupValue.getTime();
            } else if (groupValue instanceof Big && group.groupByAttributeValue instanceof Big) {
                return group.groupByAttributeValue.eq(groupValue);
            }
            return group.groupByAttributeValue === groupValue;
        });

        if (!group) {
            group = {
                groupByAttributeValue: groupValue,
                items: []
            };
            dataSourceItemGroupsResult.push(group);
        }

        group.items.push(item);

        if (dynamicName && (!group.dynamicNameValue || group.dynamicNameValue === "(empty)")) {
            // update name if it is still empty
            const { status, value } = dynamicName.get(item);
            if (status === "loading") {
                return null;
            }
            group.dynamicNameValue = value ?? "(empty)";
        }
    }

    return dataSourceItemGroupsResult;
}

function extractDataPoints(
    series: PlotDataSeries,
    seriesName: string | undefined,
    dataSourceItems?: ObjectItem[]
): PlotChartDataPoints | null {
    const xValue = series.dataSet === "static" ? ensure(series.staticXAttribute) : ensure(series.dynamicXAttribute);
    const yValue = series.dataSet === "static" ? ensure(series.staticYAttribute) : ensure(series.dynamicYAttribute);

    if (!dataSourceItems) {
        const dataSource = ensure(series.staticDataSource);

        if (!dataSource.items) {
            return null;
        }

        dataSourceItems = dataSource.items;
    }
    const xData: PlotChartDataPoints["x"] = [];
    const yData: PlotChartDataPoints["y"] = [];
    const hoverTextData: Array<string | undefined> = [];

    for (const item of dataSourceItems) {
        const x = xValue.get(item);
        const y = yValue.get(item);

        if (!x.value) {
            xData.push(null);
        } else {
            xData.push(x.value instanceof Big ? x.value.toNumber() : x.value);
        }
        if (!y.value) {
            yData.push(null);
        } else {
            yData.push(y.value instanceof Big ? y.value.toNumber() : y.value);
        }

        const tooltipHoverTextSource =
            series.dataSet === "dynamic" ? series.dynamicTooltipHoverText : series.staticTooltipHoverText;
        hoverTextData.push(tooltipHoverTextSource?.get(item).value);
    }

    return {
        ...(seriesName ? { name: seriesName } : {}),
        x: xData,
        y: yData,
        hovertext: hoverTextData.some(text => text !== undefined && text !== "")
            ? (hoverTextData as string[])
            : undefined,
        hoverinfo: hoverTextData.some(text => text !== undefined && text !== "") ? "text" : "none"
    };
}

type AggregationTypeEnum = "none" | "count" | "sum" | "avg" | "min" | "max" | "median" | "mode" | "first" | "last";

export function getPlotChartDataTransforms(
    aggregationType: AggregationTypeEnum,
    dataPoints: PlotChartDataPoints
): PlotData["transforms"] {
    if (aggregationType === "none") {
        return [];
    }
    return [
        {
            type: "aggregate",
            groups: dataPoints.x.map(dataPoint => {
                if (!dataPoint) {
                    return "";
                }
                return typeof dataPoint === "string" || typeof dataPoint === "number"
                    ? dataPoint.toLocaleString()
                    : dataPoint.toLocaleDateString();
            }),
            aggregations: [
                {
                    target: "y",
                    func: aggregationType,
                    enabled: true
                }
            ]
        }
    ];
}
