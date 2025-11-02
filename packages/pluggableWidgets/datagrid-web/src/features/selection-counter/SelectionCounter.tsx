import { observer } from "mobx-react-lite";
import { useLegacyContext } from "../../helpers/root-context";
import { useSelectionCounterViewModel } from "./injection-hooks";

export const SelectionCounter = observer(function SelectionCounter() {
    const selectionCountStore = useSelectionCounterViewModel();
    const { selectActionHelper } = useLegacyContext();

    return (
        <div className="widget-datagrid-selection-counter">
            <span className="widget-datagrid-selection-text" aria-live="polite" aria-atomic="true">
                {selectionCountStore.selectedCountText}
            </span>
            &nbsp;
            <button className="widget-datagrid-btn-link" onClick={selectActionHelper.onClearSelection}>
                {selectionCountStore.clearButtonLabel}
            </button>
        </div>
    );
});
