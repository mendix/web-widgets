import { createElement, ReactElement, memo, ReactNode } from "react";

import { getGlobalSelectionContext } from "@mendix/widget-plugin-grid/selection";
import { getGlobalFilterContextObject } from "@mendix/widget-plugin-filtering";
import { HeaderFiltersStore } from "../helpers/state/HeaderFiltersStore";

interface WidgetHeaderContextProps {
    selectionContextValue: { status: "all" | "some" | "none"; toggle: () => void } | undefined;
    children?: ReactNode;
    state: ReturnType<typeof useMultipleFiltering>;
    eventsChannelName?: string;
    headerFilterStore: HeaderFiltersStore;
}

const component = memo((props: WidgetHeaderContextProps) => {
    const SelectionContext = getGlobalSelectionContext();
    const FilterContext = getGlobalFilterContextObject();

    return (
        <FilterContext.Provider
            value={{
                eventsChannelName: props.eventsChannelName,
                filterDispatcher: prev => {
                    if (prev.filterType) {
                        props.headerFilterStore.setFilter(prev.filterType, prev);
                        props.headerFilterStore.setDirty();
                    }
                    return prev;
                },
                multipleAttributes: props.headerFilterStore.multipleAttributes,
                multipleInitialFilters: props.headerFilterStore.multipleInitialFilters
            }}
        >
            <SelectionContext.Provider value={props.selectionContextValue}>{props.children}</SelectionContext.Provider>
        </FilterContext.Provider>
    );
});

component.displayName = "WidgetHeaderContext";

// Override NamedExoticComponent type
export const WidgetHeaderContext = component as (props: WidgetHeaderContextProps) => ReactElement;
