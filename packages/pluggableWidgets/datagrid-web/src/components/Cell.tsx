import { ObjectItem } from "mendix";
import { createElement, ReactElement, memo } from "react";
import { ColumnsType } from "../../typings/DatagridProps";
import { CellComponentProps } from "../../typings/CellComponent";
import { CellElement } from "./CellElement";
import { useEventCallback } from "@mendix/widget-plugin-hooks/useEventCallback";
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";

// eslint-disable-next-line prefer-arrow-callback
const component = memo(function Cell(props: CellComponentProps<ColumnsType>): ReactElement {
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
            alignment={props.column.alignment}
            borderTop={props.rowIndex === 0}
            className={props.column.columnClass?.get(props.item)?.value}
            onClick={props.cellClickActAs === "none" ? undefined : onClick}
            wrapText={props.column.wrapText}
        >
            <CellContent column={props.column} item={props.item} />
        </CellElement>
    );
});

export const Cell = component as (props: CellComponentProps<ColumnsType>) => ReactElement;

interface CellContentProps {
    column: ColumnsType;
    item: ObjectItem;
}

function CellContent({ column, item }: CellContentProps): ReactElement {
    switch (column.showContentAs) {
        case "attribute": {
            return (
                <span className="td-text" title={column.tooltip?.get(item)?.value}>
                    {column.attribute?.get(item)?.displayValue ?? ""}
                </span>
            );
        }
        case "dynamicText": {
            return (
                <span className="td-text" title={column.tooltip?.get(item)?.value}>
                    {column.dynamicText?.get(item)?.value ?? ""}
                </span>
            );
        }
        case "customContent": {
            return <div className="td-custom-content">{column.content?.get(item)}</div>;
        }
        default:
            throw new Error(`Unknown content type: ${column.showContentAs}`);
    }
}
