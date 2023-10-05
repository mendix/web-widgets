import { ThreeStateCheckBox } from "@mendix/widget-plugin-grid/components/ThreeStateCheckBox";
import { getMultiSelectStatus } from "@mendix/widget-plugin-grid/selection/utils";
import { Fragment, ReactElement, createElement } from "react";
import { useGridProps } from "../helpers/useGridProps";

export function CheckboxColumnHeader(): ReactElement {
    const { selectionProps, selectionHelper } = useGridProps();
    const { showCheckboxColumn, showSelectAllToggle, onSelectAll } = selectionProps;

    if (showCheckboxColumn) {
        return (
            <div className="th widget-datagrid-col-select" role="columnheader">
                {showSelectAllToggle && (
                    <ThreeStateCheckBox value={getMultiSelectStatus(selectionHelper)} onChange={onSelectAll} />
                )}
            </div>
        );
    }

    return <Fragment />;
}
