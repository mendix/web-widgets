import classNames from "classnames";
import { ObjectItem } from "mendix";
import { ReactElement } from "react";
import { SelectActionHelper } from "../helpers/SelectActionHelper";
import { EventsController } from "../typings/CellComponent";
import { GridColumn } from "../typings/GridColumn";
import { Cell } from "./Cell";
import { CheckboxCell } from "./CheckboxCell";
import { SelectorCell } from "./SelectorCell";

export interface RowProps {
    className?: string;
    columns: GridColumn[];
    item: ObjectItem;
    index: number;
    showSelectorCell?: boolean;
    selectActionHelper: SelectActionHelper;
    totalRows: number;
    clickable: boolean;
    eventsController: EventsController;
}

export function Row(props: RowProps): ReactElement {
    const { selectActionHelper, totalRows, eventsController } = props;
    const selected = selectActionHelper.isSelected(props.item);
    const ariaSelected = selectActionHelper.selectionType === "None" ? undefined : selected;
    const borderTop = props.index === 0;

    return (
        <div
            className={classNames("tr", { "tr-selected": selected }, props.className)}
            role="row"
            aria-selected={ariaSelected}
        >
            {selectActionHelper.showCheckboxColumn && (
                <CheckboxCell
                    item={props.item}
                    key="checkbox_cell"
                    borderTop={borderTop}
                    rowIndex={props.index}
                    lastRow={props.index === totalRows - 1}
                />
            )}
            {props.columns.map((column, baseIndex) => {
                const cell = (
                    <Cell
                        key={`row_${props.item.id}_col_${column.columnId}`}
                        column={column}
                        rowIndex={props.index}
                        columnIndex={selectActionHelper.showCheckboxColumn ? baseIndex + 1 : baseIndex}
                        item={props.item}
                        clickable={props.clickable}
                        preview={false}
                        eventsController={eventsController}
                    />
                );

                return cell;
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
