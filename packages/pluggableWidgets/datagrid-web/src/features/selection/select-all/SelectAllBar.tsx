import { observer } from "mobx-react-lite";
import { useSelectAllBarViewModel } from "./injection-hooks";

export const SelectAllBar = observer(function SelectAllBar() {
    const vm = useSelectAllBarViewModel();

    if (!vm.isBarVisible) return null;

    return (
        <div className="widget-datagrid-select-all-bar">
            {vm.selectionStatus}&nbsp;
            {vm.isClearVisible ? (
                <button className="widget-datagrid-btn-link" onClick={() => vm.onClear()}>
                    {vm.clearSelectionLabel}
                </button>
            ) : (
                <button
                    disabled={vm.isSelectAllDisabled}
                    className="widget-datagrid-btn-link"
                    onClick={() => vm.onSelectAll()}
                >
                    {vm.selectAllLabel}
                </button>
            )}
        </div>
    );
});
