import { observer } from "mobx-react-lite";
import { PropsWithChildren, ReactElement } from "react";
import { getGlobalFilterContextObject } from "@mendix/widget-plugin-filtering/context";
import { getGlobalDynamicModeContext } from "@mendix/widget-plugin-filtering/dynamic/context";
import { DynamicFilterBuilder } from "@mendix/widget-plugin-filtering/dynamic/DynamicFilterBuilder";
import { DynamicFilterSet } from "@mendix/widget-plugin-filtering/dynamic/DynamicFilterSet";
import { getGlobalSelectionContext, useCreateSelectionContextValue } from "@mendix/widget-plugin-grid/selection";
import {
    useDatagridFilterAPI,
    useDynamicFilterSet,
    useMainGate,
    useSelectionHelper,
    useTexts
} from "../model/hooks/injection-hooks";

const Selection = getGlobalSelectionContext();
const FilterAPI = getGlobalFilterContextObject();
const DynamicMode = getGlobalDynamicModeContext();
const DYNAMIC_MODE_ON = { dynamic: true };

function HeaderContainer(props: PropsWithChildren<{ dynamic: boolean }>): ReactElement {
    const filterAPI = useDatagridFilterAPI();
    const selectionContext = useCreateSelectionContextValue(useSelectionHelper());
    return (
        <DynamicMode.Provider value={props.dynamic ? DYNAMIC_MODE_ON : null}>
            <FilterAPI.Provider value={filterAPI}>
                <Selection.Provider value={selectionContext}>{props.children}</Selection.Provider>
            </FilterAPI.Provider>
        </DynamicMode.Provider>
    );
}

const Builder = observer(function Builder(props: { filterSet: DynamicFilterSet }): ReactElement {
    const texts = useTexts();
    const { name } = useMainGate().props;
    return <DynamicFilterBuilder filterSet={props.filterSet} texts={texts.dynamicFilterTexts} name={name} />;
});

export const WidgetHeader = function WidgetHeader(): ReactElement | null {
    const { headerAriaLabel } = useTexts();
    const { filtersPlaceholder } = useMainGate().props;
    const filterSet = useDynamicFilterSet();

    if (!filtersPlaceholder && !filterSet) return null;

    return (
        <div className="widget-datagrid-header header-filters" aria-label={headerAriaLabel}>
            <HeaderContainer dynamic={filterSet !== null}>{filtersPlaceholder}</HeaderContainer>
            {filterSet && <Builder filterSet={filterSet} />}
        </div>
    );
};
