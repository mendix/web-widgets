import { createElement, ReactElement, memo, useMemo, useState, ReactNode } from "react";
import { FilterCondition } from "mendix/filters";
import { FilterListType } from "../../typings/DatagridProps";
import { getGlobalSelectionContext } from "@mendix/widget-plugin-grid/selection";
import {
    getGlobalFilterContextObject,
    useMultipleFiltering,
    readInitFilterValues
} from "@mendix/widget-plugin-filtering";

interface WidgetHeaderContextProps {
    filterList: FilterListType[];
    selectionContextValue: { status: "all" | "some" | "none"; toggle: () => void } | undefined;
    setFiltered: (val: boolean) => void;
    viewStateFilters?: FilterCondition;
    children?: ReactNode;
    state: ReturnType<typeof useMultipleFiltering>;
}

const component = memo((props: WidgetHeaderContextProps) => {
    const SelectionContext = getGlobalSelectionContext();
    const FilterContext = getGlobalFilterContextObject();
    const multipleFilteringState = props.state;
    const filterList = useMemo(
        () => props.filterList.reduce((filters, { filter }) => ({ ...filters, [filter.id]: filter }), {}),
        [props.filterList]
    );
    const [multipleInitialFilters] = useState(() =>
        props.filterList.reduce(
            (filters, { filter }) => ({
                ...filters,
                [filter.id]: readInitFilterValues(filter, props.viewStateFilters)
            }),
            {}
        )
    );

    return (
        <FilterContext.Provider
            value={{
                filterDispatcher: prev => {
                    if (prev.filterType) {
                        const [, filterDispatcher] = multipleFilteringState[prev.filterType];
                        filterDispatcher(prev);
                        props.setFiltered(true);
                    }
                    return prev;
                },
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
