import Big from "big.js";
import {
    ObjectItem,
    DynamicValue,
    ListValue,
    ListExpressionValue,
    ListAttributeValue,
    ListActionValue,
    EditableValue
} from "mendix";
import { useEffect, useState } from "react";
import { ensure } from "@mendix/widget-plugin-platform/utils/ensure";
import { Datum, PlotData } from "plotly.js-dist-min";
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import { ExtraTraceProps } from "../components/types";
import { aggregateDataPoints, AggregationType } from "../utils/aggregations";

// Use "value" prop on EditableValue to extract AttributeValue, as AttributeValue not exported.
type AttributeValue = EditableValue["value"];

export type PlotChartDataPoints = {
    x: Datum[];
    y: Datum[];
    hovertext: string[] | undefined;
    hoverinfo: PlotData["hoverinfo"];
    dataSourceItems: ObjectItem[];
    // We want this optional.
    name?: PlotData["name"];
};

interface DataSourceItemGroup {
    groupByAttributeValue: string | boolean | Date | Big;
    dynamicNameValue?: string;
    dynamicCustomLineStyleValue?: string;
    items: ObjectItem[];
}

export type PlotChartSeries = PlotChartDataPoints & ExtraTraceProps;

export interface PlotDataSeries {
    dataSet: "static" | "dynamic";
    customSeriesOptions: string | undefined;
    groupByAttribute?: ListAttributeValue<string | boolean | Date | Big>;
    staticDataSource?: ListValue;
    aggregationType?: AggregationType;
    dynamicDataSource?: ListValue;
    staticName?: DynamicValue<string>;
    dynamicName?: ListExpressionValue<string>;
    staticXAttribute?: ListAttributeValue<Date | Big | string>;
    dynamicXAttribute?: ListAttributeValue<Date | Big | string>;
    staticYAttribute?: ListAttributeValue<Date | Big | string>;
    dynamicYAttribute?: ListAttributeValue<Date | Big | string>;
    staticOnClickAction?: ListActionValue;
    dynamicOnClickAction?: ListActionValue;
    staticTooltipHoverText?: ListExpressionValue<string>;
    dynamicTooltipHoverText?: ListExpressionValue<string>;
}

type MapperHelpers = {
    getExpressionValue<T extends AttributeValue = AttributeValue>(
        attribute: ListExpressionValue<T>,
        items: ObjectItem[]
    ): DynamicValue<T>["value"];
};

export type SeriesMapper<T> = (serie: T, dataPoints: PlotChartDataPoints, helpers: MapperHelpers) => Partial<PlotData>;

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

function bindListAction(listAction: ListActionValue): (item: ObjectItem) => void {
    return item => executeAction(listAction.get(item));
}

function loadStaticSeries(series: PlotDataSeries, mapSerie: SeriesMapper<PlotDataSeries>): PlotChartSeries | null {
    const { staticName, dataSet, customSeriesOptions, staticOnClickAction: onClickAction } = series;

    if (dataSet !== "static") {
        throw Error("Expected series to be static");
    }

    const raw = extractDataPoints(series, staticName?.value);
    if (!raw) {
        return null;
    }

    const agg = series.aggregationType as AggregationType;
    const points = agg && agg !== "none" ? aggregateDataPoints(agg, raw) : raw;

    return {
        ...(onClickAction ? { onClick: bindListAction(onClickAction) } : undefined),
        ...points,
        ...mapSerie(series, points, mapperHelpers),
        customSeriesOptions
    } as PlotChartSeries;
}

function loadDynamicSeries(series: PlotDataSeries, mapSerie: SeriesMapper<PlotDataSeries>): PlotChartSeries[] | null {
    const { dataSet, customSeriesOptions, dynamicOnClickAction: onClickAction } = series;

    if (dataSet !== "dynamic") {
        throw Error("Expected series to be dynamic");
    }

    const groups = groupDataSourceItems(series);
    if (!groups) {
        return null;
    }

    return groups
        .map(group => {
            const raw = extractDataPoints(series, group.dynamicNameValue, group.items);
            if (!raw) {
                return null;
            }
            const agg = series.aggregationType as AggregationType;
            const points = agg && agg !== "none" ? aggregateDataPoints(agg, raw) : raw;

            return {
                ...(onClickAction ? { onClick: bindListAction(onClickAction) } : undefined),
                ...points,
                ...mapSerie(series, points, mapperHelpers),
                customSeriesOptions
            } as PlotChartSeries;
        })
        .filter((x): x is PlotChartSeries => Boolean(x));
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
        dataSourceItems,
        hovertext: hoverTextData.some(text => text !== undefined && text !== "")
            ? (hoverTextData as string[])
            : undefined,
        hoverinfo: hoverTextData.some(text => text !== undefined && text !== "") ? "text" : "none"
    };
}

export const mapperHelpers: MapperHelpers = {
    // NOTE: For now ignore explicit "return undefined" statements. They exist just to make TS happy.
    getExpressionValue(attr, items) {
        for (const item of items) {
            const dynamicValue = attr.get(item);
            if (dynamicValue.status !== "available") {
                return undefined;
            } else {
                return dynamicValue.value;
            }
        }
        return undefined;
    }
};
