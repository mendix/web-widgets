import { observer } from "mobx-react-lite";
import { Fragment } from "react";
import { useSelectionCounterViewModel } from "../deps-hooks";
import { useLegacyContext } from "../helpers/root-context";

export const SelectionCounter = observer(function SelectionCounter() {
    const selectionCountStore = useSelectionCounterViewModel();
    const { selectActionHelper } = useLegacyContext();

    return (
        <Fragment>
            <span className="widget-datagrid-selection-count" aria-live="polite" aria-atomic="true">
                {selectionCountStore.selectedCountText}
            </span>
            &nbsp;
            <button className="widget-datagrid-btn-link" onClick={selectActionHelper.onClearSelection}>
                {selectionCountStore.clearButtonLabel}
            </button>
        </Fragment>
    );
});
