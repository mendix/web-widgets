import { observer } from "mobx-react-lite";
import { useSelectionCounterViewModel } from "./injection-hooks";
import { useSelectActions } from "../../model/hooks/injection-hooks";

export const SelectionCounter = observer(function SelectionCounter() {
    const selectionCounterVM = useSelectionCounterViewModel();
    const selectActions = useSelectActions();

    return (
        <div className="widget-gallery-selection-counter">
            <span className="widget-gallery-selection-counter-text" aria-live="polite" aria-atomic="true">
                {selectionCounterVM.selectedCountText}
            </span>
            &nbsp;|&nbsp;
            <button className="widget-gallery-clear-selection" onClick={() => selectActions.clearSelection()}>
                {selectionCounterVM.clearButtonLabel}
            </button>
        </div>
    );
});
