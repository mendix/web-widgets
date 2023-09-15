// import classNames from "classnames";
import { ObjectItem } from "mendix";
import { createElement, ReactElement, ReactNode, Fragment, memo } from "react";
import { ColumnsType, ShowContentAsEnum } from "../../typings/DatagridProps";
import { CellComponentProps } from "../../typings/CellComponent";
import { CellElement } from "./CellElement";
import { useEventCallback } from "@mendix/widget-plugin-hooks/useEventCallback";
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";

type RenderFn = (column: ColumnsType, item: ObjectItem) => ReactNode;

const contentTypes: Record<ShowContentAsEnum, RenderFn> = {
    attribute: (column, item) => (
        <span className="td-text" title={column.tooltip?.get(item)?.value}>
            {column.attribute?.get(item)?.displayValue ?? ""}
        </span>
    ),
    dynamicText: (column, item) => (
        <span className="td-text" title={column.tooltip?.get(item)?.value}>
            {column.dynamicText?.get(item)?.value ?? ""}
        </span>
    ),
    customContent: (column, item) => <div className="td-custom-content">{column.content?.get(item)}</div>
};

interface CellContentProps {
    column: ColumnsType;
    item: ObjectItem;
}
const CellContent = memo((props: CellContentProps) => {
    return <Fragment>{contentTypes[props.column.showContentAs](props.column, props.item)}</Fragment>;
});

CellContent.displayName = "CellContent";

const component = memo((props: CellComponentProps<ColumnsType>) => {
    const onClick = useEventCallback(() => {
        const { rowAction, item, cellClickActAs, onSelect } = props;
        if (cellClickActAs === "selectRow") {
            onSelect?.(item);
        } else if (rowAction) {
            executeAction(rowAction.get(item));
        }
    });

    return (
        <CellElement
            data-row={`[${props.rowIndex}, ${props.columnIndex}]`}
            borderTop={props.rowIndex === 0}
            alignment={props.column.alignment}
            wrapText={props.column.wrapText}
            className={props.column.columnClass?.get(props.item)?.value}
            onClick={onClick}
        >
            <CellContent column={props.column} item={props.item} />
        </CellElement>
    );
});

component.displayName = "Cell";

export const Cell = component as (props: CellComponentProps<ColumnsType>) => ReactElement;
