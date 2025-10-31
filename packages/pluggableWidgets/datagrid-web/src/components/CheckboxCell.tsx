import { useFocusTargetProps } from "@mendix/widget-plugin-grid/keyboard-navigation/useFocusTargetProps";
import { ObjectItem } from "mendix";
import { FocusEvent, ReactElement } from "react";
import { useBasicData } from "../deps-hooks";
import { useLegacyContext } from "../helpers/root-context";
import { CellElement, CellElementProps } from "./CellElement";

export type CheckboxCellProps = CellElementProps & {
    rowIndex: number;
    lastRow?: boolean;
    item: ObjectItem;
};

export function CheckboxCell({ item, rowIndex, lastRow, ...rest }: CheckboxCellProps): ReactElement {
    const keyNavProps = useFocusTargetProps<HTMLInputElement>({
        columnIndex: 0,
        rowIndex
    });

    const { selectActionHelper, checkboxEventsController } = useLegacyContext();
    const { selectRowLabel, gridInteractive } = useBasicData();
    return (
        <CellElement {...rest} clickable={gridInteractive} className="widget-datagrid-col-select" tabIndex={-1}>
            <input
                checked={selectActionHelper.isSelected(item)}
                type="checkbox"
                tabIndex={keyNavProps.tabIndex}
                data-position={keyNavProps["data-position"]}
                onChange={stub}
                onFocus={lastRow ? scrollParentOnFocus : undefined}
                ref={keyNavProps.ref}
                aria-label={`${selectRowLabel ?? "Select row"} ${rowIndex + 1}`}
                {...checkboxEventsController.getProps(item)}
            />
        </CellElement>
    );
}

function scrollParentOnFocus(event: FocusEvent): void {
    if (typeof event.target.parentElement?.scrollIntoView === "function") {
        event.target.parentElement.scrollIntoView(false);
    }
}

function stub(): void {
    // to prevent react test error about checked prop without onChange.
}
