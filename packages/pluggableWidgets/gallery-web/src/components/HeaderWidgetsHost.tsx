import { getGlobalFilterContextObject } from "@mendix/widget-plugin-filtering/context";
import { getGlobalSelectionContext, useCreateSelectionContextValue } from "@mendix/widget-plugin-grid/selection";
import { getGlobalSortContext } from "@mendix/widget-plugin-sorting/react/context";
import { ReactElement, ReactNode } from "react";
import { useGalleryRootScope } from "../helpers/root-context";

const SelectionContext = getGlobalSelectionContext();
const SortAPI = getGlobalSortContext();
const FilterAPI = getGlobalFilterContextObject();

export function HeaderWidgetsHost(props: { children?: ReactNode }): ReactElement {
    const { selectionHelper, rootStore } = useGalleryRootScope();
    const selectionContext = useCreateSelectionContextValue(selectionHelper);

    return (
        <FilterAPI.Provider value={rootStore.filterAPI}>
            <SortAPI.Provider value={rootStore.sortAPI}>
                <SelectionContext.Provider value={selectionContext}>{props.children}</SelectionContext.Provider>
            </SortAPI.Provider>
        </FilterAPI.Provider>
    );
}
