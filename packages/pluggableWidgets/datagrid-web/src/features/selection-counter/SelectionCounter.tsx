import { observer } from "mobx-react-lite";
import { useSelectActions } from "../../model/hooks/injection-hooks";
import { useSelectionCounterViewModel } from "./injection-hooks";

export const SelectionCounter = observer(function SelectionCounter() {
    const selectionCountStore = useSelectionCounterViewModel();
    const selectActions = useSelectActions();

    return (
        <div className="widget-datagrid-selection-counter">
            <span className="widget-datagrid-selection-text">{selectionCountStore.selectedCountText}</span>
            &nbsp;|&nbsp;
            <button className="widget-datagrid-btn-link" onClick={() => selectActions.clearSelection()}>
                {selectionCountStore.clearButtonLabel}
            </button>
        </div>
    );
});
