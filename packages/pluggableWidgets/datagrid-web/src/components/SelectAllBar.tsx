import { If } from "@mendix/widget-plugin-component-kit/If";
import { observer } from "mobx-react-lite";
import { useDatagridRootScope } from "../helpers/root-context";

export const SelectAllBar = observer(function SelectAllBar() {
    const { selectAllBarViewModel: vm } = useDatagridRootScope();

    if (!vm.isBarVisible) return null;

    return (
        <div className="widget-datagrid-select-all-bar">
            {vm.selectionStatus}&nbsp;
            <If condition={vm.isSelectAllVisible}>
                <button
                    disabled={vm.isSelectAllDisabled}
                    className="widget-datagrid-btn-link"
                    onClick={() => vm.onSelectAll()}
                >
                    {vm.selectAllLabel}
                </button>
            </If>
            <If condition={vm.isClearVisible}>
                <button className="widget-datagrid-btn-link" onClick={() => vm.onClear()}>
                    {vm.clearSelectionLabel}
                </button>
            </If>
        </div>
    );
});
