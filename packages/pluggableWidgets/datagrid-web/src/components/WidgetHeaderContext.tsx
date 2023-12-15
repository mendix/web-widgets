import { createElement, ReactElement, memo, useMemo, useState, ReactNode } from "react";
import { FilterListType } from "../../typings/DatagridProps";
import { getGlobalSelectionContext } from "@mendix/widget-plugin-grid/selection";
import { getGlobalFilterContextObject, readInitFilterValues } from "@mendix/widget-plugin-filtering";
import { Filter, SetHeaderFilter } from "../typings/GridModel";

interface WidgetHeaderContextProps {
    filterList: FilterListType[];
    selectionContextValue: { status: "all" | "some" | "none"; toggle: () => void } | undefined;
    children?: ReactNode;
    setFilter: SetHeaderFilter;
    initFilter: Filter;
}

const component = memo((props: WidgetHeaderContextProps) => {
    const SelectionContext = getGlobalSelectionContext();
    const FilterContext = getGlobalFilterContextObject();
    const filterList = useMemo(
        () => props.filterList.reduce((filters, { filter }) => ({ ...filters, [filter.id]: filter }), {}),
        [props.filterList]
    );
    const [multipleInitialFilters] = useState(() =>
        props.filterList.reduce(
            (filters, { filter }) => ({
                ...filters,
                [filter.id]: readInitFilterValues(filter, props.initFilter)
            }),
            {}
        )
    );

    return (
        <FilterContext.Provider
            value={{
                filterDispatcher: props.setFilter,
                multipleAttributes: filterList,
                multipleInitialFilters
            }}
        >
            <SelectionContext.Provider value={props.selectionContextValue}>{props.children}</SelectionContext.Provider>
        </FilterContext.Provider>
    );
});

component.displayName = "WidgetHeaderContext";

// Override NamedExoticComponent type
export const WidgetHeaderContext = component as (props: WidgetHeaderContextProps) => ReactElement;
