import { createElement } from "react";
import { getGlobalFilterContextObject } from "@mendix/widget-plugin-filtering/context";
import { getGlobalSortContext } from "@mendix/widget-plugin-sorting/context";
import { SortAPIProvider } from "@mendix/widget-plugin-sorting/providers/SortAPIProvider";
import { HeaderFiltersStore } from "@mendix/widget-plugin-filtering/stores/generic/HeaderFiltersStore";
import {
    getGlobalSelectionContext,
    SelectionHelper,
    useCreateSelectionContextValue
} from "@mendix/widget-plugin-grid/selection";
const SelectionContext = getGlobalSelectionContext();
const FilterContext = getGlobalFilterContextObject();
const SortAPIContext = getGlobalSortContext();

function FilterAPIProvider(props: React.PropsWithChildren<{ filtersStore: HeaderFiltersStore }>): React.ReactElement {
    return <FilterContext.Provider value={props.filtersStore.context}>{props.children}</FilterContext.Provider>;
}

function SelectionStatusProvider(
    props: React.PropsWithChildren<{ selectionHelper?: SelectionHelper }>
): React.ReactElement {
    const value = useCreateSelectionContextValue(props.selectionHelper);
    return <SelectionContext.Provider value={value}>{props.children}</SelectionContext.Provider>;
}

interface HeaderContainerProps
    extends React.PropsWithChildren<{
        filtersStore: HeaderFiltersStore;
        sortProvider: SortAPIProvider;
        selectionHelper?: SelectionHelper;
    }> {}

export function HeaderContainer(props: HeaderContainerProps): React.ReactElement {
    return (
        <FilterAPIProvider filtersStore={props.filtersStore}>
            <SortAPIContext.Provider value={props.sortProvider.context}>
                <SelectionStatusProvider selectionHelper={props.selectionHelper}>
                    {props.children}
                </SelectionStatusProvider>
            </SortAPIContext.Provider>
        </FilterAPIProvider>
    );
}
