import { ThreeStateCheckBox } from "@mendix/widget-plugin-grid/components/ThreeStateCheckBox";
import { Fragment, ReactElement, createElement } from "react";
import { useHelpersContext } from "../helpers/helpers-context";
import { useSelectionStatus } from "../helpers/useSelectionStatus";

export function CheckboxColumnHeader(): ReactElement {
    const { selectActionHelper } = useHelpersContext();
    const { showCheckboxColumn, showSelectAllToggle, onSelectAll } = selectActionHelper;
    const selectionStatus = useSelectionStatus();

    if (showCheckboxColumn === false) {
        return <Fragment />;
    }

    let checkbox = null;

    if (showSelectAllToggle) {
        if (selectionStatus === "unknown") {
            throw new Error("Don't know how to render checkbox with selectionStatus=unknown");
        }

        checkbox = <ThreeStateCheckBox value={selectionStatus} onChange={onSelectAll} />;
    }

    return (
        <div className="th widget-datagrid-col-select" role="columnheader">
            {checkbox}
        </div>
    );
}
