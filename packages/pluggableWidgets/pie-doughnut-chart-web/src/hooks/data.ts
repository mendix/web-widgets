import { ensure } from "@mendix/pluggable-widgets-tools";
import { ChartWidgetProps, compareAttrValuesAsc } from "@mendix/shared-charts/main";
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import Big from "big.js";
import { ObjectItem, ValueStatus } from "mendix";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PieChartContainerProps } from "../../typings/PieChartProps";

type PieChartDataSeriesHooks = Pick<
    PieChartContainerProps,
    | "customSeriesOptions"
    | "holeRadius"
    | "onClickAction"
    | "seriesColorAttribute"
    | "seriesDataSource"
    | "seriesName"
    | "seriesSortAttribute"
    | "seriesSortOrder"
    | "seriesValueAttribute"
    | "tooltipHoverText"
    | "seriesItemSelection"
>;

type LocalPieChartData = {
    itemName: string | undefined;
    itemValue: number | undefined;
    itemColor: string | undefined;
    itemSortValue: string | boolean | Date | Big | undefined;
    itemHoverText: string | undefined;
};

export const usePieChartDataSeries = ({
    holeRadius,
    customSeriesOptions,
    seriesColorAttribute,
    seriesDataSource,
    seriesName,
    seriesSortAttribute,
    seriesSortOrder,
    seriesValueAttribute,
    onClickAction,
    tooltipHoverText,
    seriesItemSelection
}: PieChartDataSeriesHooks): ChartWidgetProps["data"] => {
    const [pieChartData, setPieChartData] = useState<LocalPieChartData[]>([]);

    useEffect(() => {
        if (seriesDataSource.status === ValueStatus.Available && seriesDataSource.items) {
            const dataSourceItems = seriesDataSource.items.map(dataSourceItem => ({
                itemName: seriesName.get(dataSourceItem).value,
                itemValue: ensure(seriesValueAttribute).get(dataSourceItem).value?.toNumber(),
                itemColor: seriesColorAttribute?.get(dataSourceItem).value,
                itemSortValue: seriesSortAttribute?.get(dataSourceItem).value,
                itemHoverText: tooltipHoverText?.get(dataSourceItem).value
            }));
            if (seriesSortAttribute) {
                dataSourceItems.sort(({ itemSortValue: firstItemSortValue }, { itemSortValue: secondItemSortValue }) =>
                    compareAttrValuesAsc(firstItemSortValue, secondItemSortValue)
                );
                if (seriesSortOrder === "desc") {
                    dataSourceItems.reverse();
                }
            }
            setPieChartData(dataSourceItems);
        }
    }, [
        seriesColorAttribute,
        seriesDataSource,
        seriesName,
        seriesSortAttribute,
        seriesSortOrder,
        seriesValueAttribute,
        tooltipHoverText
    ]);

    const onClick = useCallback(
        (item: ObjectItem) => {
            executeAction(onClickAction?.get(item));
            if (seriesItemSelection && seriesItemSelection.type === "Single") {
                seriesItemSelection.setSelection(item);
            }
        },
        [onClickAction, seriesItemSelection]
    );

    return useMemo<ChartWidgetProps["data"]>(
        () => [
            {
                customSeriesOptions,
                hole: holeRadius / 100,
                labels: pieChartData.map(({ itemName }) => itemName ?? null),
                values: pieChartData.map(({ itemValue }) => itemValue ?? 0),
                marker: {
                    colors: pieChartData.map(({ itemColor }) => itemColor)
                },
                hovertext: pieChartData.map(({ itemHoverText }) => itemHoverText ?? ""),
                hoverinfo: pieChartData.some(({ itemHoverText }) => itemHoverText !== undefined && itemHoverText !== "")
                    ? "text"
                    : "none",
                dataSourceItems: sortDatasourceItems(
                    seriesDataSource.items ?? [],
                    seriesSortOrder,
                    seriesSortAttribute
                ),
                onClick
            }
        ],
        [
            customSeriesOptions,
            holeRadius,
            pieChartData,
            onClick,
            seriesDataSource.items,
            seriesSortAttribute,
            seriesSortOrder
        ]
    );
};

function sortDatasourceItems(
    items: ObjectItem[],
    seriesSortOrder: "asc" | "desc",
    seriesSortAttribute: PieChartContainerProps["seriesSortAttribute"]
): ObjectItem[] {
    const sortedItems = [...items].sort((firstItem, secondItem) => {
        const first = seriesSortAttribute?.get(firstItem).value;
        const second = seriesSortAttribute?.get(secondItem).value;
        return compareAttrValuesAsc(first, second);
    });

    if (seriesSortOrder === "desc") {
        sortedItems.reverse();
    }

    return sortedItems;
}
