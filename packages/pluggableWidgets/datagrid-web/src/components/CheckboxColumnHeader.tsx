import { ThreeStateCheckBox } from "@mendix/widget-plugin-component-kit/ThreeStateCheckBox";
import { SelectionStatus } from "@mendix/widget-plugin-grid/selection";
import { Fragment, ReactElement, ReactNode } from "react";
import { useDatagridRootScope } from "../helpers/root-context";

export function CheckboxColumnHeader(): ReactElement {
    const { selectActionHelper, basicData, selectionHelper } = useDatagridRootScope();
    const { showCheckboxColumn, showSelectAllToggle, onSelectAll } = selectActionHelper;
    const { selectAllRowsLabel } = basicData;

    if (showCheckboxColumn === false) {
        return <Fragment />;
    }

    return (
        <div className="th widget-datagrid-col-select" role="columnheader">
            {showSelectAllToggle && (
                <Checkbox
                    status={selectionHelper?.type === "Multi" ? selectionHelper.selectionStatus : "none"}
                    onChange={onSelectAll}
                    aria-label={selectAllRowsLabel}
                />
            )}
        </div>
    );
}

function Checkbox(props: { status: SelectionStatus; onChange: () => void; "aria-label"?: string }): ReactNode {
    if (props.status === "unknown") {
        console.error("Data grid 2: don't know how to render column checkbox with selectionStatus=unknown");
        return null;
    }
    return (
        <ThreeStateCheckBox
            value={props.status}
            onChange={props.onChange}
            aria-label={props["aria-label"] ?? "Select all rows"}
        />
    );
}
