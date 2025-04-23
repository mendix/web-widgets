import { getGlobalFilterContextObject } from "@mendix/widget-plugin-filtering/context";
import {
    getGlobalSelectionContext,
    SelectionHelper,
    useCreateSelectionContextValue
} from "@mendix/widget-plugin-grid/selection";
import { createElement, memo, ReactElement, ReactNode } from "react";
import { RootGridStore } from "../helpers/state/RootGridStore";

interface WidgetHeaderContextProps {
    children?: ReactNode;
    selectionHelper?: SelectionHelper;
    rootStore: RootGridStore;
}

const SelectionContext = getGlobalSelectionContext();
const FilterContext = getGlobalFilterContextObject();

function SelectionStatusProvider(props: { selectionHelper?: SelectionHelper; children?: ReactNode }): ReactElement {
    const value = useCreateSelectionContextValue(props.selectionHelper);
    return <SelectionContext.Provider value={value}>{props.children}</SelectionContext.Provider>;
}

function HeaderContainer(props: WidgetHeaderContextProps): ReactElement {
    return (
        <FilterContext.Provider value={null}>
            <SelectionStatusProvider selectionHelper={props.selectionHelper}>{props.children}</SelectionStatusProvider>
        </FilterContext.Provider>
    );
}

const component = memo(HeaderContainer);

component.displayName = "WidgetHeaderContext";

// Override NamedExoticComponent type
export const WidgetHeaderContext = component as (props: WidgetHeaderContextProps) => ReactElement;
