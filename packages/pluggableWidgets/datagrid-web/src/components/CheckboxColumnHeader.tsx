import { ThreeStateCheckBox } from "@mendix/widget-plugin-component-kit/ThreeStateCheckBox";
import { Fragment, ReactElement } from "react";
import { useDatagridRootScope } from "../helpers/root-context";

export function CheckboxColumnHeader(): ReactElement {
    const { selectActionHelper, basicData, selectAllProgressStore, rootStore } = useDatagridRootScope();
    const { showCheckboxColumn, showSelectAllToggle, onSelectAll } = selectActionHelper;
    const { selectionStatus, selectAllRowsLabel } = basicData;

    if (showCheckboxColumn === false) {
        return <Fragment />;
    }

    let checkbox = null;

    if (showSelectAllToggle) {
        if (selectionStatus === "unknown") {
            throw new Error("Don't know how to render checkbox with selectionStatus=unknown");
        }

        const handleHeaderToggle = async (): Promise<void> => {
            if (selectAllProgressStore.selecting) {
                return;
            }

            if (selectActionHelper.canSelectAllPages && selectionStatus !== "none") {
                // Toggle off still uses normal flow
                onSelectAll();
                return;
            }

            if (selectActionHelper.canSelectAllPages && selectionStatus === "none") {
                // Delegate to root store orchestration
                await rootStore?.startMultiPageSelectAll(selectActionHelper);
                return;
            }

            onSelectAll();
        };

        checkbox = (
            <ThreeStateCheckBox
                value={selectionStatus}
                onChange={handleHeaderToggle}
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
