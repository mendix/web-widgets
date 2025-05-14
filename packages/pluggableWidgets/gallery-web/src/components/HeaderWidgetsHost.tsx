import { createElement } from "react";
// import { getGlobalSortContext } from "@mendix/widget-plugin-sorting/context";
import { getGlobalSelectionContext, useCreateSelectionContextValue } from "@mendix/widget-plugin-grid/selection";
import { useGalleryRootScope } from "../helpers/root-context";
const SelectionContext = getGlobalSelectionContext();
// const SortAPIContext = getGlobalSortContext();

export function HeaderWidgetsHost(props: { children?: React.ReactNode }): React.ReactElement {
    const { selectionHelper } = useGalleryRootScope();
    const selectionContext = useCreateSelectionContextValue(selectionHelper);

    return <SelectionContext.Provider value={selectionContext}>{props.children}</SelectionContext.Provider>;
}
