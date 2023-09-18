import { ObjectItem, ListActionValue } from "mendix";
import { createElement, ReactElement } from "react";
import { Column } from "../../typings/Column";
import { CellComponent, ClickAction } from "../../typings/CellComponent";
import { CellElement } from "./CellElement";
import classNames from "classnames";
import { SelectionMethod } from "../features/selection";
import { GridColumn } from "../models/GridColumn";

export interface RowProps<C extends Column> {
    className?: string;
    CellComponent: CellComponent<C>;
    columns: C[];
    gridColumns: GridColumn[];
    item: ObjectItem;
    index: number;
    showSelectorCell?: boolean;
    selectionMethod: SelectionMethod;
    onSelect: (item: ObjectItem) => void;
    selected: boolean;
    rowAction?: ListActionValue;
}

export function Row<C extends Column>(props: RowProps<C>): ReactElement {
    const { CellComponent: Cell } = props;

    return (
        <div className={classNames("tr", { "tr-selected": props.selected }, props.className)} role="row">
            {props.selectionMethod === "checkbox" && (
                <CellElement key="checkbox_cell" borderTop={props.index === 0}>
                    <input
                        checked={props.selected}
                        onChange={() => props.onSelect(props.item)}
                        type="checkbox"
                        tabIndex={-1}
                    />
                </CellElement>
            )}
            {props.columns.map((column, columnIndex) => (
                <Cell
                    key={`row_${props.item.id}_col_${props.gridColumns[columnIndex].id}`}
                    column={column}
                    rowIndex={props.index}
                    columnIndex={columnIndex}
                    item={props.item}
                    onSelect={props.onSelect}
                    cellClickActAs={resolveClickAction(props.selectionMethod, props.rowAction)}
                    rowAction={props.rowAction}
                />
            ))}
            {props.showSelectorCell && (
                <CellElement
                    key="column_selector_cell"
                    aria-hidden
                    className={"column-selector"}
                    borderTop={props.index === 0}
                />
            )}
        </div>
    );
}

function resolveClickAction(method: SelectionMethod, action: ListActionValue | undefined): ClickAction {
    return method !== "none" ? "selectRow" : action !== undefined ? "executeAction" : "none";
}
