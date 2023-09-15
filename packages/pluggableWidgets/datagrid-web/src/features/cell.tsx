import { createElement, useCallback } from "react";
import { ListActionValue } from "mendix";
import { CellRenderer } from "../components/Table";
import { ColumnsType } from "../../typings/DatagridProps";
import classNames from "classnames";
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
// import { CellContent } from "../components/CellContent";

interface CellRendererHookProps {
    columns: ColumnsType[];
    onClick?: ListActionValue;
}

export function useCellRenderer({ onClick, columns }: CellRendererHookProps): CellRenderer {
    const renderer: CellRenderer = (renderCell, item, columnIndex) => {
        const column = columns[columnIndex];

        return renderCell(
            <span>Fun Fun Fun</span>,
            classNames(`align-column-${column.alignment}`, column.columnClass?.get(item)?.value, {
                "wrap-text": column.wrapText
            }),
            onClick ? () => executeAction(onClick?.get(item)) : undefined
        );
    };

    return useCallback(renderer, [columns, onClick]);
}
