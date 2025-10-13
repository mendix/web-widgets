import { If } from "@mendix/widget-plugin-component-kit/If";
import { observer } from "mobx-react-lite";
import { createElement } from "react";
import { useDatagridRootScope } from "../helpers/root-context";

export const SelectAllBar = observer(function SelectAllBar(): React.ReactNode {
    const { selectAllBarViewModel: vm } = useDatagridRootScope();

    if (!vm.barVisible) return null;

    return (
        <div className="widget-datagrid-select-all-bar">
            {vm.selectionCountText}&nbsp;
            <If condition={vm.selectAllVisible}>
                <button className="widget-datagrid-btn-invisible btn" onClick={() => vm.onSelectAll()}>
                    {vm.selectAllLabel}
                </button>
            </If>
            <If condition={vm.clearVisible}>
                <button className="widget-datagrid-btn-invisible btn" onClick={() => vm.onClear()}>
                    {vm.clearSelectionLabel}
                </button>
            </If>
        </div>
    );
});
