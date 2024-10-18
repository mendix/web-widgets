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
    const { cellEventsController } = useHelpersContext();
    const { CellComponent: Cell, preview, totalRows } = props;
    const [showCheckbox, selected, ariaSelected] = useSelectionFlags(props.item);
    const borderTop = props.index === 0;

    return (
        <div
            className={classNames("tr", { "tr-selected": selected, "tr-preview": preview }, props.className)}
            role="row"
            aria-selected={ariaSelected}
        >
            {showCheckbox && (
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
                        columnIndex={showCheckbox ? baseIndex + 1 : baseIndex}
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

const useSelectionFlags = (
    item: ObjectItem
): [showCheckbox: boolean, selected: boolean, ariaSelected: boolean | undefined] => {
    const { selectActionHelper } = useHelpersContext();
    const selected = selectActionHelper.isSelected(item);
    const ariaSelected = selectActionHelper.selectionType === "None" ? undefined : selected;
    return [selectActionHelper.showCheckboxColumn, selected, ariaSelected];
};
