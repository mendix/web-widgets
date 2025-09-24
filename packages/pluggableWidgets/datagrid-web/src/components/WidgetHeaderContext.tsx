import { getGlobalFilterContextObject } from "@mendix/widget-plugin-filtering/context";
import {
    getGlobalSelectionContext,
    SelectionHelper,
    useCreateSelectionContextValue
} from "@mendix/widget-plugin-grid/selection";
import { memo, ReactElement, ReactNode } from "react";
import { RootGridStore } from "../helpers/state/RootGridStore";

interface WidgetHeaderContextProps {
    children?: ReactNode;
    selectionHelper?: SelectionHelper;
    rootStore: RootGridStore;
}

const SelectionContext = getGlobalSelectionContext();
const FilterContext = getGlobalFilterContextObject();

function HeaderContainer(props: WidgetHeaderContextProps): ReactElement {
    const selectionContext = useCreateSelectionContextValue(props.selectionHelper);
    return (
        <FilterContext.Provider value={props.rootStore.filterAPI}>
            <SelectionContext.Provider value={selectionContext}>{props.children}</SelectionContext.Provider>
        </FilterContext.Provider>
    );
}

const component = memo(HeaderContainer);

component.displayName = "WidgetHeaderContext";

// Override NamedExoticComponent type
export const WidgetHeaderContext = component as (props: WidgetHeaderContextProps) => ReactElement;
