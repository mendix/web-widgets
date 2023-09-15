import { createElement, ReactElement, memo, useMemo, useState, ReactNode } from "react";
import { FilterCondition } from "mendix/filters";
import { FilterListType } from "../../typings/DatagridProps";
import { getGlobalSelectionContext } from "@mendix/widget-plugin-grid/selection";
import { getGlobalFilterContextObject, useMultipleFiltering } from "@mendix/widget-plugin-filtering";
import { extractFilters } from "../features/filters";

interface GridHeaderWidgetsProps {
    filterList: FilterListType[];
    selectionContextValue: { status: "all" | "some" | "none"; toggle: () => void } | undefined;
    setFiltered: (val: boolean) => void;
    viewStateFilters?: FilterCondition;
    children?: ReactNode;
    state: ReturnType<typeof useMultipleFiltering>;
}

const component = memo((props: GridHeaderWidgetsProps) => {
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
                [filter.id]: extractFilters(filter, props.viewStateFilters)
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

component.displayName = "GridHeaderWidgets";

// Override NamedExoticComponent type
export const GridHeaderWidgets = component as (props: GridHeaderWidgetsProps) => ReactElement;
