import { DispatchFilterUpdate, FilterState, unwrapAndExpression } from "@mendix/widget-plugin-filtering";
import { useEventCallback } from "@mendix/widget-plugin-hooks/useEventCallback";
import { ListValue } from "mendix";
import { FilterCondition } from "mendix/filters";
import { and } from "mendix/filters/builders";
import { createElement, useCallback, useEffect, useMemo } from "react";
import { ColumnsType, DatagridContainerProps, FilterListType } from "../../../typings/DatagridProps";
import { FilterRenderer } from "../../typings/FilterRenderer";
import { MultiAttrFilteringProvider } from "./MultiAttrFilteringProvider";
import { ReferenceFilteringProvider } from "./ReferenceFilteringProvider";
import { SingleAttrFilteringProvider } from "./SingleAttrFilteringProvider";
import { SetFilterAction, useColumnFilters } from "./useColumnFilters";
import { useHeaderFilters } from "./useHeaderFilters";
import { MultiFilterRenderer } from "../../typings/MultiFilterRenderer";

function useMultiFilterRenderer(
    filterList: FilterListType[],
    dispatch: DispatchFilterUpdate,
    datasourceFilter: FilterCondition | undefined
): MultiFilterRenderer {
    const attributeList = useMemo(() => filterList.map(item => item.filter), [filterList]);
    return function renderHeader(children) {
        return (
            <MultiAttrFilteringProvider
                dispatch={dispatch}
                attributeList={attributeList}
                datasourceFilter={datasourceFilter}
            >
                {children}
            </MultiAttrFilteringProvider>
        );
    };
}

function useColumnFilterRenderer(
    columns: ColumnsType[],
    dispatch: React.Dispatch<SetFilterAction>,
    datasourceFilter: FilterCondition | undefined
): FilterRenderer {
    const dispatchWithIndex = useCallback(
        (value: FilterState, index: number) => dispatch({ type: "SetFilter", payload: { columnNumber: index, value } }),
        [dispatch]
    );
    return (renderWrapper, index) => {
        const column = columns.at(index);

        if (column?.filterAssociation) {
            return renderWrapper(
                <ReferenceFilteringProvider dispatch={dispatchWithIndex} column={column} index={index}>
                    {column.filter}
                </ReferenceFilteringProvider>
            );
        }

        if (column?.attribute) {
            return renderWrapper(
                <SingleAttrFilteringProvider
                    index={index}
                    dispatch={dispatchWithIndex}
                    attribute={column.attribute}
                    datasourceFilter={datasourceFilter}
                >
                    {column.filter}
                </SingleAttrFilteringProvider>
            );
        }

        return renderWrapper(`Unable to render filter: column ${index} is undefined`);
    };
}

function useUpdateFilterEffect(datasource: ListValue, nextFilters: FilterCondition[]): void {
    const setFilter = useEventCallback(datasource.setFilter);

    useEffect(() => {
        const prevFilters = unwrapAndExpression(datasource.filter);

        const isEqual =
            prevFilters.length === nextFilters.length &&
            prevFilters.every((c, index) => Object.is(c, nextFilters[index]));

        if (!isEqual) {
            setFilter(nextFilters.length > 1 ? and(...nextFilters) : nextFilters.at(0));
        }
    }, [setFilter, datasource.filter, nextFilters]);
}

export function useFiltering({
    columns,
    datasource,
    filterList
}: DatagridContainerProps): [FilterRenderer, MultiFilterRenderer] {
    const [columnFilters, dispatchColumn] = useColumnFilters(columns.length);
    const [headerFilters, dispatchHeader] = useHeaderFilters();
    const finalFilters = useMemo(() => [...columnFilters, ...headerFilters], [columnFilters, headerFilters]);

    useUpdateFilterEffect(datasource, finalFilters);

    return [
        useColumnFilterRenderer(columns, dispatchColumn, datasource.filter),
        useMultiFilterRenderer(filterList, dispatchHeader, datasource.filter)
    ];
}
