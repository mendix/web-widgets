import { getGlobalFilterContextObject } from "@mendix/widget-plugin-filtering/context";
import { HeaderFiltersStore } from "@mendix/widget-plugin-filtering/stores/generic/HeaderFiltersStore";
import {
    getGlobalSelectionContext,
    SelectionHelper,
    useCreateSelectionContextValue
} from "@mendix/widget-plugin-grid/selection";
import { createElement, memo, ReactElement, ReactNode } from "react";

interface WidgetHeaderContextProps {
    children?: ReactNode;
    filtersStore: HeaderFiltersStore;
    selectionHelper?: SelectionHelper;
}

const SelectionContext = getGlobalSelectionContext();
const FilterContext = getGlobalFilterContextObject();

function FilterAPIProvider(props: { filtersStore: HeaderFiltersStore; children?: ReactNode }): ReactElement {
    return <FilterContext.Provider value={props.filtersStore.context}>{props.children}</FilterContext.Provider>;
}

function SelectionStatusProvider(props: { selectionHelper?: SelectionHelper; children?: ReactNode }): ReactElement {
    const value = useCreateSelectionContextValue(props.selectionHelper);
    return <SelectionContext.Provider value={value}>{props.children}</SelectionContext.Provider>;
}

function HeaderContainer(props: WidgetHeaderContextProps): ReactElement {
    return (
        <FilterAPIProvider filtersStore={props.filtersStore}>
            <SelectionStatusProvider selectionHelper={props.selectionHelper}>{props.children}</SelectionStatusProvider>
        </FilterAPIProvider>
    );
}

const component = memo(HeaderContainer);

component.displayName = "WidgetHeaderContext";

// Override NamedExoticComponent type
export const WidgetHeaderContext = component as (props: WidgetHeaderContextProps) => ReactElement;
