import classNames from "classnames";
import { ObjectItem } from "mendix";
import { ReactElement, createElement } from "react";
import { useHelpersContext } from "../helpers/helpers-context";
import { CellComponent } from "../typings/CellComponent";
import { GridColumn } from "../typings/GridColumn";
import { CheckboxCell } from "./CheckboxCell";
import { SelectorCell } from "./SelectorCell";

export interface RowProps<C extends GridColumn> {
    className?: string;
    CellComponent: CellComponent<C>;
    columns: C[];
    item: ObjectItem;
    index: number;
    showSelectorCell?: boolean;
    selectableWrapper?: (column: number, children: React.ReactElement) => React.ReactElement;
    preview: boolean;
    totalRows: number;
    interactive: boolean;
}

export function Row<C extends GridColumn>(props: RowProps<C>): ReactElement {
    const { selectActionHelper, cellEventsController } = useHelpersContext();
    const { CellComponent: Cell, preview, totalRows } = props;
    const selected = selectActionHelper.isSelected(props.item);
    const ariaSelected = selectActionHelper.selectionType === "None" ? undefined : selected;
    const borderTop = props.index === 0;

    return (
        <div
            className={classNames("tr", { "tr-selected": selected, "tr-preview": preview }, props.className)}
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
                    interactive={props.interactive}
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
                        clickable={props.interactive}
                        preview={preview}
                        eventsController={cellEventsController}
                    />
                );

                return preview ? props.selectableWrapper?.(baseIndex, cell) : cell;
            })}
            {props.showSelectorCell && (
                <SelectorCell
                    key="column_selector_cell"
                    borderTop={borderTop}
                    clickable={props.interactive}
                    tabIndex={-1}
                />
            )}
        </div>
    );
}
