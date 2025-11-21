import { useFocusTargetProps } from "@mendix/widget-plugin-grid/keyboard-navigation/useFocusTargetProps";
import { ObjectItem } from "mendix";
import { FocusEvent, ReactElement, useMemo } from "react";
import {
    useCheckboxEventsHandler,
    useDatagridConfig,
    useSelectActions,
    useTexts
} from "../model/hooks/injection-hooks";
import { CellElement, CellElementProps } from "./CellElement";

export type CheckboxCellProps = CellElementProps & {
    rowIndex: number;
    lastRow?: boolean;
    item: ObjectItem;
};

export function CheckboxCell({ item, rowIndex, lastRow, ...rest }: CheckboxCellProps): ReactElement {
    const config = useDatagridConfig();
    const selectActions = useSelectActions();
    const checkboxEventsHandler = useCheckboxEventsHandler();
    const { selectRowLabel } = useTexts();
    const keyNavProps = useFocusTargetProps<HTMLInputElement>({
        columnIndex: 0,
        rowIndex
    });

    return (
        <CellElement {...rest} clickable={config.isInteractive} className="widget-datagrid-col-select" tabIndex={-1}>
            <input
                checked={selectActions.isSelected(item)}
                type="checkbox"
                tabIndex={keyNavProps.tabIndex}
                data-position={keyNavProps["data-position"]}
                onChange={stub}
                onFocus={lastRow ? scrollParentOnFocus : undefined}
                ref={keyNavProps.ref}
                aria-label={`${selectRowLabel ?? "Select row"} ${rowIndex + 1}`}
                {...useMemo(() => checkboxEventsHandler.getProps(item), [item, checkboxEventsHandler])}
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
