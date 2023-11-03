import { FilterContextValue } from "@mendix/widget-plugin-filtering";
import { useEventCallback } from "@mendix/widget-plugin-hooks/useEventCallback";
import { FilterCondition } from "mendix/filters";
import { and } from "mendix/filters/builders";
import { useEffect, createElement, Fragment } from "react";
import { ColumnsType, DatagridContainerProps } from "../../../typings/DatagridProps";
import { FilterRenderer } from "../../typings/FilterRenderer";
import { HeaderContextProvider } from "../../typings/HeaderContextProvider";
import { getAssociationProps } from "./utils";
import { extractFilters } from "./extractInitProps";
import { ConditionValue, SetFilterAction, useColumnFilters } from "./useColumnFilters";
import { useFilterContextProvider } from "./useFilterContextProvider";

function createFilterContextValue(
    column: ColumnsType,
    columnNumber: number,
    dispatch: React.Dispatch<SetFilterAction>,
    datasourceFilter: FilterCondition | undefined
): FilterContextValue | undefined {
    if (!column) {
        return;
    }

    const filterDispatcher = (value: ConditionValue): void =>
        dispatch({ type: "SetFilter", payload: { columnNumber, value } });

    if (column.filterAssociation) {
        return { filterDispatcher, associationProperties: getAssociationProps(column) };
    }

    return {
        filterDispatcher,
        singleAttribute: column.attribute,
        singleInitialFilter: extractFilters(column.attribute, datasourceFilter)
    };
}

function useRenderer(
    columns: ColumnsType[],
    dispatch: React.Dispatch<SetFilterAction>,
    datasourceFilter: FilterCondition | undefined,
    createContextValue: (
        column: ColumnsType,
        columnNumber: number,
        dispatch: React.Dispatch<SetFilterAction>,
        datasourceFilter: FilterCondition | undefined
    ) => FilterContextValue | undefined
): FilterRenderer {
    const Provider = useFilterContextProvider();
    return (renderWrapper, columnNumber) => {
        const column = columns.at(columnNumber);

        if (!column) {
            return createElement("span", {}, "Unable to render filter: column is undefined.");
        }

        return renderWrapper(
            createElement(
                Provider,
                {
                    value: createContextValue(column, columnNumber, dispatch, datasourceFilter)
                },
                column.filter
            )
        );
    };
}

function useRendererWithEffects({ columns, datasource }: DatagridContainerProps): FilterRenderer {
    const setFilter = useEventCallback(datasource.setFilter);
    const [state, dispatch] = useColumnFilters(columns.length);

    useEffect(() => {
        const conditions = state.filters.flatMap(value => {
            const cond = value?.getFilterCondition();
            return cond ? [cond] : [];
        });
        setFilter(conditions.length > 1 ? and(...conditions) : conditions.at(0));
    }, [state, setFilter]);

    return useRenderer(columns, dispatch, datasource.filter, createFilterContextValue);
}

export function useFiltering(props: DatagridContainerProps): [FilterRenderer, HeaderContextProvider] {
    return [useRendererWithEffects(props), Fragment];
}
