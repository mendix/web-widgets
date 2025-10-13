import { If } from "@mendix/widget-plugin-component-kit/If";
import { observer } from "mobx-react-lite";
import { createElement } from "react";
import { useDatagridRootScope } from "../helpers/root-context";

export const SelectAllBar = observer(function SelectAllBar(): React.ReactNode {
    const { selectAllBarViewModel } = useDatagridRootScope();
    const { barVisible, selectionCountText, clearVisible, clearSelectionLabel, selectAllVisible, selectAllLabel } =
        selectAllBarViewModel;

    if (!barVisible) return null;

    return (
        <div className="widget-datagrid-select-all-bar">
            {selectionCountText}&nbsp;
            <If condition={selectAllVisible}>
                <button className="btn" onClick={() => selectAllBarViewModel.onSelectAll()}>
                    {selectAllLabel}
                </button>
            </If>
            <If condition={clearVisible}>
                <button className="btn" onClick={() => selectAllBarViewModel.onClear()}>
                    {clearSelectionLabel}
                </button>
            </If>
        </div>
    );
});
