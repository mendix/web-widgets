import { If } from "@mendix/widget-plugin-component-kit/If";
import { observer } from "mobx-react-lite";
import { createElement } from "react";
import { useDatagridRootScope } from "../helpers/root-context";

type SelectionCounterLocation = "top" | "bottom" | undefined;

export const SelectionCounter = observer(function SelectionCounter({
    location
}: {
    location?: SelectionCounterLocation;
}) {
    const { selectionCountStore, selectActionHelper } = useDatagridRootScope();

    const containerClass = location === "top" ? "widget-datagrid-tb-start" : "widget-datagrid-pb-start";

    const clearButtonAriaLabel = `${selectionCountStore.clearButtonLabel} (${selectionCountStore.selectedCount} selected)`;

    return (
        <If condition={selectionCountStore.displayCount !== ""}>
            <div className={containerClass}>
                <span className="widget-datagrid-selection-count" aria-live="polite" aria-atomic="true">
                    {selectionCountStore.displayCount}
                </span>
                &nbsp;|&nbsp;
                <button
                    className="widget-datagrid-clear-selection"
                    onClick={selectActionHelper.onClearSelection}
                    aria-label={clearButtonAriaLabel}
                >
                    {selectionCountStore.clearButtonLabel}
                </button>
            </div>
        </If>
    );
});
