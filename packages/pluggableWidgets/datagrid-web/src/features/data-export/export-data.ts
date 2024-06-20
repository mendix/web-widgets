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

export function exportData(data: ObjectItem[], columns: ColumnsType[]): ExportDataResult {
    let hasLoadingItem = false;
    type ExportDataValue = boolean | number | string;
    type ExportDataColumn = ExportDataValue[];

    const items: ExportDataColumn[] = data.map(item => {
        return columns.map(column => {
            let value: ExportDataValue = "";

            switch (column.showContentAs) {
                case "attribute":
                    if (column.attribute) {
                        const attributeItem = column.attribute.get(item);
                        const attributeType = typeof attributeItem.value;

                        if (attributeItem.status === "available") {
                            if (attributeType === "boolean") {
                                value = Boolean(attributeItem.value);
                            } else if (attributeItem.value instanceof Big) {
                                value = attributeItem.value.toNumber();
                            } else {
                                value = attributeItem.displayValue;
                            }
                        } else {
                            value = "n/a";
                        }
                    }
                    break;
                case "dynamicText":
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
                    break;
                default:
                    value = "n/a (custom content)";
                    break;
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
