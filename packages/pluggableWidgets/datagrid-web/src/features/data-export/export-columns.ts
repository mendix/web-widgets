import { isAvailable } from "@mendix/widget-plugin-platform/framework/is-available";
import { ColumnsType } from "../../../typings/DatagridProps";
import { ColumnDefinition, Message } from "./types";

export function exportColumns(columns: ColumnsType[]): Message {
    const exportColumns: ColumnDefinition[] = columns.map(column => ({
        name: column.header && isAvailable(column.header) ? column.header.value?.toString() ?? "" : "",
        type: column.attribute?.type.toString() ?? ""
    }));

    return { type: "columns", payload: exportColumns };
}
