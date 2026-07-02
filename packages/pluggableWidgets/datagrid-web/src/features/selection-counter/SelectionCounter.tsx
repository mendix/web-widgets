import { observer } from "mobx-react-lite";
import { useRef } from "react";
import { useSelectActions } from "../../model/hooks/injection-hooks";
import { returnFocusToGrid } from "../../utils/focus-return";
import { useSelectionCounterViewModel } from "./injection-hooks";

export const SelectionCounter = observer(function SelectionCounter() {
    const selectionCountStore = useSelectionCounterViewModel();
    const selectActions = useSelectActions();
    const counterRef = useRef<HTMLDivElement>(null);

    const handleClear = (): void => {
        selectActions.clearSelection();
        returnFocusToGrid(counterRef.current);
    };

    return (
        <div ref={counterRef} className="widget-datagrid-selection-counter">
            <span className="widget-datagrid-selection-text" aria-live="polite" aria-atomic="true">
                {selectionCountStore.selectedCountText}
            </span>
            &nbsp;|&nbsp;
            <button className="widget-datagrid-btn-link" onClick={handleClear}>
                {selectionCountStore.clearButtonLabel}
            </button>
        </div>
    );
});
