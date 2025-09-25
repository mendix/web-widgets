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

            // When multi-page selection is enabled, handle both select and unselect across all pages
            if (selectActionHelper.canSelectAllPages) {
                if (selectionStatus === "none") {
                    // Select all pages
                    await rootStore?.startMultiPageSelectAll(selectActionHelper);
                } else {
                    // Unselect all pages (both "all" and "some" states)
                    await rootStore?.clearAllPages();
                }
                return;
            }

            // Fallback to normal single-page toggle
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
