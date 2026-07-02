import { observer } from "mobx-react-lite";
import { useRef } from "react";
import { returnFocusToGrid } from "../../utils/focus-return";
import { useSelectAllBarViewModel } from "./injection-hooks";

export const SelectAllBar = observer(function SelectAllBar() {
    const vm = useSelectAllBarViewModel();
    const barRef = useRef<HTMLDivElement>(null);

    if (!vm.isBarVisible) return null;

    const isDisabled = !vm.isClearVisible && vm.isSelectAllDisabled;

    const handleClick = (): void => {
        if (isDisabled) {
            return;
        }
        if (vm.isClearVisible) {
            vm.onClear();
            returnFocusToGrid(barRef.current);
        } else {
            vm.onSelectAll();
        }
    };

    return (
        <div ref={barRef} className="widget-datagrid-select-all-bar">
            {vm.selectionStatus}&nbsp;
            <button
                aria-disabled={isDisabled}
                aria-live="assertive"
                className="widget-datagrid-btn-link"
                onClick={handleClick}
            >
                {vm.isClearVisible ? vm.clearSelectionLabel : vm.selectAllLabel}
            </button>
        </div>
    );
});
