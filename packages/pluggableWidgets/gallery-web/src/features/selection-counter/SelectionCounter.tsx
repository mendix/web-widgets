import { observer } from "mobx-react-lite";
import { useSelectActions } from "../../model/hooks/injection-hooks";
import { useSelectionCounterViewModel } from "./injection-hooks";

export const SelectionCounter = observer(function SelectionCounter() {
    const selectionCounterVM = useSelectionCounterViewModel();
    const selectActions = useSelectActions();

    return (
        <div className="widget-gallery-selection-counter">
            <span className="widget-gallery-selection-counter-text" aria-live="polite" aria-atomic="true">
                {selectionCounterVM.selectedCountText}
            </span>
            &nbsp;|&nbsp;
            <button className="widget-gallery-btn-link" onClick={() => selectActions.clearSelection()}>
                {selectionCounterVM.clearButtonLabel}
            </button>
        </div>
    );
});
