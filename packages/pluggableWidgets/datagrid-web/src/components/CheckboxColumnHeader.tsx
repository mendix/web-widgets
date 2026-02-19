import { If } from "@mendix/widget-plugin-component-kit/If";
import { ThreeStateCheckBox } from "@mendix/widget-plugin-component-kit/ThreeStateCheckBox";
import { observer } from "mobx-react-lite";
import { Fragment, ReactElement, ReactNode } from "react";
import { useDatagridConfig, useSelectActions, useSelectionHelper, useTexts } from "../model/hooks/injection-hooks";

export function CheckboxColumnHeader(): ReactElement {
    const { selectAllCheckboxEnabled, checkboxColumnEnabled } = useDatagridConfig();
    const { singleSelectionColumnLabel } = useTexts();
    const selectionHelper = useSelectionHelper();

    if (checkboxColumnEnabled === false) {
        return <Fragment />;
    }

    return (
        <div className="th widget-datagrid-col-select" role="columnheader">
            <If condition={selectAllCheckboxEnabled}>
                <Checkbox />
            </If>
            <If condition={selectionHelper?.type === "Single"}>
                <span className="sr-only">{singleSelectionColumnLabel || "Select single row"}</span>
            </If>
        </div>
    );
}

const Checkbox = observer(function Checkbox(): ReactNode {
    const { selectAllRowsLabel } = useTexts();
    const selectionHelper = useSelectionHelper();
    const selectActions = useSelectActions();

    if (!selectionHelper || selectionHelper.type !== "Multi") {
        return null;
    }
    return (
        <ThreeStateCheckBox
            value={selectionHelper.selectionStatus}
            onChange={() => selectActions.selectPage()}
            aria-label={selectAllRowsLabel || "Select all rows"}
        />
    );
});
