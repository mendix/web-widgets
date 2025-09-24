import { ThreeStateCheckBox } from "@mendix/widget-plugin-component-kit/ThreeStateCheckBox";
import { Fragment, ReactElement, useCallback } from "react";
import { useDatagridRootScope } from "../helpers/root-context";

export function CheckboxColumnHeader(): ReactElement {
    const { selectActionHelper, basicData } = useDatagridRootScope();
    const { showCheckboxColumn, showSelectAllToggle, onSelectAll } = selectActionHelper;
    const { selectionStatus, selectAllRowsLabel } = basicData;

    const onChange = useCallback(() => onSelectAll(), [onSelectAll]);

    if (showCheckboxColumn === false) {
        return <Fragment />;
    }

    let checkbox = null;

    if (showSelectAllToggle) {
        if (selectionStatus === "unknown") {
            throw new Error("Don't know how to render checkbox with selectionStatus=unknown");
        }

        checkbox = (
            <ThreeStateCheckBox
                value={selectionStatus}
                onChange={onChange}
                aria-label={selectAllRowsLabel ?? "Select all rows"}
            />
        );
    }

    return (
        <div className="th widget-datagrid-col-select" role="columnheader">
            {checkbox}
        </div>
    );
}
