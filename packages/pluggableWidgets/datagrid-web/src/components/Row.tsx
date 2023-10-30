import classNames from "classnames";
import { ListActionValue, ObjectItem } from "mendix";
import { ReactElement, createElement } from "react";
import { useWidgetProps } from "../helpers/useWidgetProps";
import { useRowInteractionProps } from "../helpers/useRowInteractionProps";
import { CellComponent } from "../typings/CellComponent";
import { GridColumn } from "../typings/GridColumn";
import { SelectorCell } from "./SelectorCell";
import { CheckboxCell } from "./CheckboxCell";

export interface RowProps<C extends GridColumn> {
    className?: string;
    CellComponent: CellComponent<C>;
    columns: C[];
    item: ObjectItem;
    index: number;
    showSelectorCell?: boolean;
    rowAction?: ListActionValue;
}

export function Row<C extends GridColumn>(props: RowProps<C>): ReactElement {
    const { CellComponent: Cell, index: rowIndex } = props;
    const { selectionProps, preview } = useWidgetProps();
    const selected = selectionProps.isSelected(props.item);
    const ariaSelected = selectionProps.selectionType === "None" ? undefined : selected;
    const [interactionProps, { cellClickableClass }] = useRowInteractionProps(
        props.item,
        selectionProps,
        props.rowAction
    );
    return (
        <div
            className={classNames("tr", { "tr-selected": selected }, props.className)}
            role="row"
            aria-selected={ariaSelected}
            {...interactionProps}
            onClick={selectionProps.selectionMethod === "checkbox" ? undefined : interactionProps.onClick}
        >
            {selectionProps.showCheckboxColumn && (
                <CheckboxCell
                    key="checkbox_cell"
                    borderTop={rowIndex === 0}
                    clickable={cellClickableClass}
                    rowIndex={rowIndex}
                    columnIndex={0}
                    checked={selected}
                    onInputClick={interactionProps.onClick}
                />
            )}
            {props.columns.map((column, baseIndex) => {
                return (
                    <Cell
                        key={`row_${props.item.id}_col_${column.columnNumber}`}
                        column={column}
                        rowIndex={rowIndex}
                        columnIndex={selectionProps.showCheckboxColumn ? baseIndex + 1 : baseIndex}
                        item={props.item}
                        clickable={cellClickableClass}
                        preview={preview}
                    />
                );
            })}
            {props.showSelectorCell && (
                <SelectorCell
                    key="column_selector_cell"
                    aria-hidden
                    borderTop={rowIndex === 0}
                    clickable={cellClickableClass}
                    rowIndex={rowIndex}
                    columnIndex={props.columns.length + (selectionProps.showCheckboxColumn ? 1 : 0)}
                />
            )}
        </div>
    );
}
