import { getAriaSelected } from "@mendix/widget-plugin-grid/selection/utils";
import classNames from "classnames";
import { ListActionValue, ObjectItem } from "mendix";
import { ReactElement, createElement } from "react";
import { useGridProps } from "../helpers/useGridProps";
import { useRowEventHandlers } from "../helpers/useRowEventHandlers";
import { CellComponent } from "../typings/CellComponent";
import { GridColumn } from "../typings/GridColumn";
import { CellElement } from "./CellElement";

export interface RowProps<C extends GridColumn> {
    className?: string;
    CellComponent: CellComponent<C>;
    columns: C[];
    item: ObjectItem;
    index: number;
    showSelectorCell?: boolean;
    rowAction?: ListActionValue;
}

const onChangeStub = (): void => {
    /* stub to prevent react warnings */
};

export function Row<C extends GridColumn>(props: RowProps<C>): ReactElement {
    const { CellComponent: Cell } = props;
    const { selectionProps } = useGridProps();
    const selected = selectionProps.isSelected(props.item);
    const handlers = useRowEventHandlers(props.item, selectionProps, props.rowAction);
    return (
        <div
            aria-selected={getAriaSelected(selectionProps.selectionType, props.item, selectionProps.isSelected)}
            className={classNames("tr", { "tr-selected": selected }, props.className)}
            onClick={event => selectionProps.onSelect(props.item, event.shiftKey)}
            role="row"
            {...handlers}
        >
            {selectionProps.showCheckboxColumn && (
                <CellElement
                    key="checkbox_cell"
                    className="widget-datagrid-col-select"
                    borderTop={props.index === 0}
                    clickable
                >
                    <input checked={selected} onChange={onChangeStub} type="checkbox" tabIndex={-1} />
                </CellElement>
            )}
            {props.columns.map((column, columnIndex) => {
                return (
                    <Cell
                        key={`row_${props.item.id}_col_${column.columnNumber}`}
                        column={column}
                        rowIndex={props.index}
                        columnIndex={columnIndex}
                        item={props.item}
                        clickable
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

// function getRowHandlers(
//     selectionType: SelectionType,
//     onSelect: onSelect,
//     rowAction: ListActionValue | undefined,
//     rowItem: ObjectItem
// ): RowHandlers {
//     let action: ((item: ObjectItem, shiftKey: boolean) => void) | undefined;

//     if (selectionType === "Multi" || selectionType === "Single") {
//         action = (item, shiftKey) => onSelect(item, shiftKey);
//     } else if (rowAction) {
//         action = item => executeAction(rowAction.get(item));
//     }

//     if (action === undefined) {
//         return {};
//     }

//     const finalAction = action;
//     return {
//         onClick(event) {
//             finalAction(rowItem, event.shiftKey);
//         },
//         onKeyUp(event) {
//             if (event.code !== "Enter" && event.code !== "Space") {
//                 return;
//             }

//             if (isOwnCell(event.currentTarget, event.target as Element)) {
//                 finalAction(rowItem, event.shiftKey);
//             }
//         }
//     };
// }

// function isOwnCell(row: Element, cell: Element): boolean {
//     return Array.from(row.children).includes(cell);
// }

// function getCellEventHandlers(
//     selection: SelectionMethod,
//     action: ListActionValue | undefined,
//     onSelect: SelectActionProps["onSelect"],
//     item: ObjectItem
// ): CellHandlers {
//     const clickAction: ClickAction =
//         selection === "rowClick" ? "selectRow" : action !== undefined ? "executeAction" : "none";

//     const handlers: CellHandlers = {};

//     if (clickAction === "none") {
//         return handlers;
//     }

//     const onClick =
//         clickAction === "selectRow"
//             ? (event?: { shiftKey?: boolean }) => {
//                   onSelect(item, event?.shiftKey ?? false);
//               }
//             : () => executeAction(action?.get(item));

//     handlers.onClick = onClick;
//     handlers.onKeyDown = e => {
//         if ((e.key === "Enter" || e.key === " ") && e.target === e.currentTarget) {
//             e.preventDefault();
//             onClick();
//         }
//     };

//     return handlers;
// }
