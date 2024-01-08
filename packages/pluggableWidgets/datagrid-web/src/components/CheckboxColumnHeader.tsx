import { ThreeStateCheckBox } from "@mendix/widget-plugin-grid/components/ThreeStateCheckBox";
import { Fragment, ReactElement, createElement } from "react";
import { useWidgetProps } from "../helpers/useWidgetProps";

export function CheckboxColumnHeader(): ReactElement {
    const { selectActionHelper, selectionStatus } = useWidgetProps();
    const { showCheckboxColumn, showSelectAllToggle, onSelectAll } = selectActionHelper;

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
