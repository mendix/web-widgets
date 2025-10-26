import { observer } from "mobx-react-lite";
import { Fragment } from "react";
import { useDatagridRootScope } from "../helpers/root-context";

export const SelectionCounter = observer(function SelectionCounter() {
    const { selectionCounterViewModel: vm, selectActionHelper } = useDatagridRootScope();

    return (
        <Fragment>
            <span className="widget-datagrid-selection-count" aria-live="polite" aria-atomic="true">
                {vm.selectedCountText}
            </span>
            <button className="widget-datagrid-clear-selection" onClick={selectActionHelper.onClearSelection}>
                {vm.selectedCountText}
            </button>
        </Fragment>
    );
});
