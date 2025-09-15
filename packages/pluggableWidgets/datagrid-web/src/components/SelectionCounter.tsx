import { If } from "@mendix/widget-plugin-component-kit/If";
import { observer } from "mobx-react-lite";
import { createElement } from "react";
import { useDatagridRootScope } from "../helpers/root-context";

export const SelectionCounter = observer(function SelectionCounter({
    clearSelectionButtonLabel
}: {
    clearSelectionButtonLabel?: string;
}) {
    const { selectionCountStore, selectActionHelper } = useDatagridRootScope();

    return (
        <If condition={selectionCountStore.displayCount !== ""}>
            <span className="widget-datagrid-selection-count">{selectionCountStore.displayCount}</span>&nbsp;|&nbsp;
            <button className="widget-datagrid-clear-selection" onClick={selectActionHelper.onClearSelection}>
                {clearSelectionButtonLabel || "Clear selection"}
            </button>
        </If>
    );
});
