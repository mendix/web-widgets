import { ColumnsType } from "typings/DynamicGridProps";
import { isAvailable } from "@mendix/widget-plugin-platform/framework/is-available";

type AgGridColType = {
    field: string;
    type: "text" | "number" | "boolean" | "date" | "dateString" | "object";
    filter: boolean;
};

export function transformColumn(column: ColumnsType): AgGridColType {
    return {
        field: column.header && isAvailable(column.header) ? column.header.value?.toString() ?? "" : "",
        type: transformType(column.attribute?.type.toString() ?? "String"),
        filter: true
    };
}

function transformType(type: string): AgGridColType["type"] {
    switch (type) {
        case "AutoNumber":
        case "Decimal":
        case "Integer":
        case "Long":
            return "number";
        case "Enum":
        case "String":
            return "text";
        case "Boolean":
            return "boolean";
        case "DateTime":
            return "date";
        default:
            return "text";
    }
}
