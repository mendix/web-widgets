import classNames from "classnames";
import { ListActionValue, ObjectItem } from "mendix";
import { ReactElement, createElement } from "react";
import { useWidgetProps } from "../helpers/useWidgetProps";
import { useRowInteractionProps } from "../helpers/useRowInteractionProps";
import { CellComponent } from "../typings/CellComponent";
import { GridColumn } from "../typings/GridColumn";
import { CellElement } from "./CellElement";
import { OnClickTriggerEnum } from "typings/DatagridProps";

export interface RowProps<C extends GridColumn> {
    className?: string;
    CellComponent: CellComponent<C>;
    columns: C[];
    item: ObjectItem;
    index: number;
    showSelectorCell?: boolean;
    actionTrigger: OnClickTriggerEnum;
    rowAction?: ListActionValue;
    preview: boolean;
    selectableWrapper: (column: number, children: React.ReactElement) => React.ReactElement;
}

const onChangeStub = (): void => {
    /* stub to prevent react warnings */
};

export function Row<C extends GridColumn>(props: RowProps<C>): ReactElement {
    const { CellComponent: Cell } = props;
    const { selectionProps, preview } = useWidgetProps();
    const selected = selectionProps.isSelected(props.item);
    const ariaSelected = selectionProps.selectionType === "None" ? undefined : selected;
    const [interactionProps, { cellClickableClass }] = useRowInteractionProps(
        props.item,
        selectionProps,
        props.actionTrigger,
        props.rowAction
    );

    return (
        <div
            className={classNames("tr", { "tr-selected": selected }, props.className)}
            role="row"
            aria-selected={ariaSelected}
            {...interactionProps}
        >
            {selectionProps.showCheckboxColumn && (
                <CellElement
                    key="checkbox_cell"
                    className="widget-datagrid-col-select"
                    borderTop={props.index === 0}
                    clickable={cellClickableClass}
                >
                    <input checked={selected} onChange={onChangeStub} type="checkbox" tabIndex={-1} />
                </CellElement>
            )}
            {props.columns.map((column, baseIndex) => {
                const cell = (
                    <Cell
                        key={`row_${props.item.id}_col_${column.columnNumber}`}
                        column={column}
                        rowIndex={props.index}
                        columnIndex={baseIndex}
                        item={props.item}
                        clickable={cellClickableClass}
                        preview={preview}
                    />
                );

                return preview ? props.selectableWrapper(baseIndex, cell) : cell;
            })}
            {props.showSelectorCell && (
                <CellElement
                    key="column_selector_cell"
                    aria-hidden
                    className="column-selector"
                    borderTop={props.index === 0}
                    clickable={cellClickableClass}
                />
            )}
        </div>
    );
}
