import { Big } from "big.js";
import { ObjectItem } from "mendix";
import { ColumnsType } from "../../../typings/DatagridProps";
import { Message } from "./types";

type ExportDataResult =
    | {
          status: "pending";
      }
    | {
          status: "ready";
          message: Message;
      };

export function exportDataFor(data: ObjectItem[], columns: ColumnsType[]): ExportDataResult {
    let hasLoadingItem = false;
    type ExportDataColumn = Array<boolean | number | string>;
    const items: ExportDataColumn[] = [];

    for (const item of data) {
        if (hasLoadingItem) {
            break;
        }
        const cols: ExportDataColumn = [];

        for (const column of columns) {
            if (column.showContentAs === "attribute") {
                if (!column.attribute) {
                    cols.push("");
                } else {
                    const attributeItem = column.attribute.get(item);
                    const attributeType = typeof attributeItem.value;

                    if (attributeType === "boolean") {
                        cols.push(Boolean(attributeItem.value));
                    } else if (attributeItem.value instanceof Big) {
                        cols.push(attributeItem.value.toNumber());
                    } else {
                        cols.push(attributeItem.displayValue);
                    }
                }
            } else if (column.showContentAs === "dynamicText") {
                if (!column.dynamicText) {
                    cols.push("");
                } else {
                    const dynamicText = column.dynamicText.get(item);

                    if (dynamicText.status === "loading") {
                        cols.push("");
                        hasLoadingItem = true;
                        break;
                    } else if (dynamicText.status === "unavailable") {
                        cols.push("n/a");
                    } else {
                        cols.push(dynamicText.value);
                    }
                }
            } else {
                cols.push("n/a (custom content)");
            }
        }

        items.push(cols);
    }

    if (hasLoadingItem) {
        return {
            status: "pending"
        };
    }

    return { status: "ready", message: { type: "data", payload: items } };
}

export function exportData(data: ObjectItem[], columns: ColumnsType[]): ExportDataResult {
    let hasLoadingItem = false;
    type ExportDataValue = boolean | number | string;
    type ExportDataColumn = Array<ExportDataValue>;

    const items: ExportDataColumn[] = data.map(item => {
        return columns.map(column => {
            let value: ExportDataValue = "";

            if (column.showContentAs === "attribute") {
                if (column.attribute) {
                    const attributeItem = column.attribute.get(item);
                    const attributeType = typeof attributeItem.value;

                    if (attributeType === "boolean") {
                        value = Boolean(attributeItem.value);
                    } else if (attributeItem.value instanceof Big) {
                        value = attributeItem.value.toNumber();
                    } else {
                        value = attributeItem.displayValue;
                    }
                }
            } else if (column.showContentAs === "dynamicText") {
                if (column.dynamicText) {
                    const dynamicText = column.dynamicText.get(item);

                    if (dynamicText.status === "loading") {
                        hasLoadingItem = true;
                    } else if (dynamicText.status === "unavailable") {
                        value = "n/a";
                    } else {
                        value = dynamicText.value;
                    }
                }
            } else {
                value = "n/a (custom content)";
            }

            return value;
        });
    });

    if (hasLoadingItem) {
        return {
            status: "pending"
        };
    }

    return { status: "ready", message: { type: "data", payload: items } };
}
