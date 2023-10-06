import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import classNames from "classnames";
import { ListActionValue, ObjectItem } from "mendix";
import { ReactElement, createElement, useCallback } from "react";
import { SelectionMethod, SelectActionProps } from "../features/selection";
import { CellComponent } from "../typings/CellComponent";
import { GridColumn } from "../typings/GridColumn";
import { CellElement } from "./CellElement";

type ClickAction = "selectRow" | "executeAction" | "none";
type onClick = React.MouseEventHandler<HTMLDivElement>;
type onKeyDown = React.KeyboardEventHandler<HTMLDivElement>;

export interface RowProps<C extends GridColumn> extends SelectActionProps {
    className?: string;
    CellComponent: CellComponent<C>;
    columns: C[];
    item: ObjectItem;
    index: number;
    showSelectorCell?: boolean;
    selectionMethod: SelectionMethod;
    rowAction?: ListActionValue;
}

const onChangeStub = () => {
    /* stub to prevent react warnings */
};

export function Row<C extends GridColumn>(props: RowProps<C>): ReactElement {
    const { CellComponent: Cell } = props;
    const onKeyUp = useKeyboardSelectAll(props.onSelectAll);
    const selected = props.isSelected(props.item);

    return (
        <div
            className={classNames("tr", { "tr-selected": selected }, props.className)}
            role="row"
            onKeyDown={() => {
                document.body.style.userSelect = "none";
            }}
            onKeyUp={onKeyUp}
        >
            {props.selectionMethod === "checkbox" && (
                <CellElement key="checkbox_cell" className="widget-datagrid-col-select" borderTop={props.index === 0}>
                    <input
                        checked={selected}
                        onClick={event => props.onSelect(props.item, event.shiftKey)}
                        onChange={onChangeStub}
                        type="checkbox"
                        tabIndex={-1}
                    />
                </CellElement>
            )}
            {props.columns.map((column, columnIndex) => {
                const { onClick, onKeyDown } = getCellEventHandlers(
                    props.selectionMethod,
                    props.rowAction,
                    props.onSelect,
                    props.item
                );
                return (
                    <Cell
                        key={`row_${props.item.id}_col_${column.columnNumber}`}
                        column={column}
                        rowIndex={props.index}
                        columnIndex={columnIndex}
                        item={props.item}
                        onClick={onClick}
                        onKeyDown={onKeyDown}
                    />
                );
            })}
            {props.showSelectorCell && (
                <CellElement
                    key="column_selector_cell"
                    aria-hidden
                    className="column-selector"
                    borderTop={props.index === 0}
                />
            )}
        </div>
    );
}

type CellHandlers = { onClick?: onClick; onKeyDown?: onKeyDown };

function getCellEventHandlers(
    selection: SelectionMethod,
    action: ListActionValue | undefined,
    onSelect: SelectActionProps["onSelect"],
    item: ObjectItem
): CellHandlers {
    const clickAction: ClickAction =
        selection === "rowClick" ? "selectRow" : action !== undefined ? "executeAction" : "none";

    const handlers: CellHandlers = {};

    if (clickAction === "none") {
        return handlers;
    }

    const onClick =
        clickAction === "selectRow"
            ? (event?: { shiftKey?: boolean }) => {
                  onSelect(item, event?.shiftKey ?? false);
              }
            : () => executeAction(action?.get(item));

    handlers.onClick = onClick;
    handlers.onKeyDown = e => {
        if ((e.key === "Enter" || e.key === " ") && e.target === e.currentTarget) {
            e.preventDefault();
            onClick();
        }
    };

    return handlers;
}

function useKeyboardSelectAll(
    onSelectAll: SelectActionProps["onSelectAll"]
): React.KeyboardEventHandler<HTMLDivElement> {
    return useCallback(
        event => {
            if (event.code === "KeyA" && (event.metaKey || event.ctrlKey)) {
                onSelectAll("selectAll");
            }
        },
        [onSelectAll]
    );
}
