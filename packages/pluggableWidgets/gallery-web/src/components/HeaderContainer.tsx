import { createElement } from "react";
import { getGlobalSortContext } from "@mendix/widget-plugin-sorting/context";
import { SortAPIProvider } from "@mendix/widget-plugin-sorting/providers/SortAPIProvider";
import {
    getGlobalSelectionContext,
    SelectionHelper,
    useCreateSelectionContextValue
} from "@mendix/widget-plugin-grid/selection";
const SelectionContext = getGlobalSelectionContext();
const SortAPIContext = getGlobalSortContext();

function SelectionStatusProvider(
    props: React.PropsWithChildren<{ selectionHelper?: SelectionHelper }>
): React.ReactElement {
    const value = useCreateSelectionContextValue(props.selectionHelper);
    return <SelectionContext.Provider value={value}>{props.children}</SelectionContext.Provider>;
}

export function HeaderContainer(
    props: React.PropsWithChildren<{
        sortProvider: SortAPIProvider;
        selectionHelper?: SelectionHelper;
    }>
): React.ReactElement {
    return (
        <SortAPIContext.Provider value={props.sortProvider.context}>
            <SelectionStatusProvider selectionHelper={props.selectionHelper}>{props.children}</SelectionStatusProvider>
        </SortAPIContext.Provider>
    );
}
