import { SelectActionsService } from "@mendix/widget-plugin-grid/main";
import classNames from "classnames";
import { ObjectItem } from "mendix";
import { ReactElement } from "react";
import { EventsController } from "../typings/CellComponent";
import { GridColumn } from "../typings/GridColumn";
import { CheckboxCell } from "./CheckboxCell";
import { DataCell } from "./DataCell";
import { SelectorCell } from "./SelectorCell";

export interface RowProps {
    className?: string;
    columns: GridColumn[];
    item: ObjectItem;
    index: number;
    showSelectorCell?: boolean;
    selectActions: SelectActionsService;
    totalRows: number;
    clickable: boolean;
    eventsController: EventsController;
    checkboxColumnEnabled: boolean;
}

export function Row(props: RowProps): ReactElement {
    const { selectActions, totalRows, eventsController } = props;
    const selected = selectActions.isSelected(props.item);
    const ariaSelected = selectActions.selectionType === "None" ? undefined : selected;
    const borderTop = props.index === 0;

    return (
        <div
            className={classNames("tr", { "tr-selected": selected }, props.className)}
            role="row"
            aria-selected={ariaSelected}
        >
            {props.checkboxColumnEnabled && (
                <CheckboxCell
                    item={props.item}
                    key="checkbox_cell"
                    borderTop={borderTop}
                    rowIndex={props.index}
                    lastRow={props.index === totalRows - 1}
                />
            )}
            {props.columns.map((column, baseIndex) => {
                return (
                    <DataCell
                        key={`row_${props.item.id}_col_${column.columnId}`}
                        column={column}
                        rowIndex={props.index}
                        columnIndex={props.checkboxColumnEnabled ? baseIndex + 1 : baseIndex}
                        item={props.item}
                        clickable={props.clickable}
                        preview={false}
                        eventsController={eventsController}
                    />
                );
            })}
            {props.showSelectorCell && (
                <SelectorCell
                    key="column_selector_cell"
                    borderTop={borderTop}
                    clickable={props.clickable}
                    tabIndex={-1}
                />
            )}
        </div>
    );
}
