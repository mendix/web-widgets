import { ThreeStateCheckBox } from "@mendix/widget-plugin-component-kit/ThreeStateCheckBox";
import { SelectionStatus } from "@mendix/widget-plugin-grid/selection";
import { Fragment, ReactElement, ReactNode } from "react";
import { useLegacyContext } from "../helpers/root-context";
import { useBasicData } from "../model/hooks/injection-hooks";

export function CheckboxColumnHeader(): ReactElement {
    const { selectActionHelper, selectionHelper } = useLegacyContext();
    const { showCheckboxColumn, showSelectAllToggle, onSelectAll } = selectActionHelper;
    const { selectAllRowsLabel } = useBasicData();

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
