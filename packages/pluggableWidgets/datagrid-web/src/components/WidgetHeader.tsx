import { getGlobalFilterContextObject } from "@mendix/widget-plugin-filtering/context";
import { getGlobalSelectionContext, useCreateSelectionContextValue } from "@mendix/widget-plugin-grid/selection";
import { PropsWithChildren, ReactElement, ReactNode } from "react";
import { useDatagridFilterAPI, useSelectionHelper } from "../model/hooks/injection-hooks";

type WidgetHeaderProps = {
    headerTitle?: string;
    headerContent?: ReactNode;
};

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

export function WidgetHeader(props: WidgetHeaderProps): ReactNode {
    const { headerContent, headerTitle } = props;

    if (!headerContent) return null;

    return (
        <div className="widget-datagrid-header header-filters" aria-label={headerTitle || undefined}>
            <HeaderContainer>{headerContent}</HeaderContainer>
        </div>
    );
}
