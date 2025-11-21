import { getGlobalFilterContextObject } from "@mendix/widget-plugin-filtering/context";
import { getGlobalSelectionContext, useCreateSelectionContextValue } from "@mendix/widget-plugin-grid/selection";
import { PropsWithChildren, ReactElement, ReactNode } from "react";
import { useDatagridFilterAPI, useMainGate, useSelectionHelper, useTexts } from "../model/hooks/injection-hooks";

const Selection = getGlobalSelectionContext();
const FilterAPI = getGlobalFilterContextObject();

function HeaderContainer(props: PropsWithChildren): ReactElement {
    const filterAPI = useDatagridFilterAPI();
    const selectionContext = useCreateSelectionContextValue(useSelectionHelper());
    return (
        <FilterAPI.Provider value={filterAPI}>
            <Selection.Provider value={selectionContext}>{props.children}</Selection.Provider>
        </FilterAPI.Provider>
    );
}

export const WidgetHeader = function WidgetHeader(): ReactNode {
    const { headerAriaLabel } = useTexts();
    const { filtersPlaceholder } = useMainGate().props;

    if (!filtersPlaceholder) return null;

    return (
        <div className="widget-datagrid-header header-filters" aria-label={headerAriaLabel}>
            <HeaderContainer>{filtersPlaceholder}</HeaderContainer>
        </div>
    );
};
