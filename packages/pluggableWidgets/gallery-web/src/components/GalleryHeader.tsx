import { getGlobalFilterContextObject } from "@mendix/widget-plugin-filtering/context";
import { getGlobalSelectionContext, useCreateSelectionContextValue } from "@mendix/widget-plugin-grid/selection";
import { getGlobalSortContext } from "@mendix/widget-plugin-sorting/react/context";
import { observer } from "mobx-react-lite";
import { ReactElement } from "react";
import { useFilterAPI, useMainGate, useSelectionHelper, useSortAPI } from "../model/hooks/injection-hooks";

const SelectionContext = getGlobalSelectionContext();
const SortAPI = getGlobalSortContext();
const FilterAPI = getGlobalFilterContextObject();

export const GalleryHeader = observer(function GalleryHeader(): ReactElement | null {
    const { filtersPlaceholder } = useMainGate().props;
    const filterAPI = useFilterAPI();
    const sortAPI = useSortAPI();
    const selectionContext = useCreateSelectionContextValue(useSelectionHelper());

    if (!filtersPlaceholder) {
        return null;
    }

    return <FilterAPI.Provider value={filterAPI}>
        <SortAPI.Provider value={sortAPI}>
            <SelectionContext.Provider value={selectionContext}>
                <section className="widget-gallery-header widget-gallery-filter">{filtersPlaceholder}</section>
            </SelectionContext.Provider>
        </SortAPI.Provider>
    </FilterAPI.Provider>
});
