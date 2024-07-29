import { ObjectItem } from "mendix";
import { ColumnsType, ShowContentAsEnum } from "typings/DynamicGridProps";
import Big from "big.js";
import { transformColumn } from "./transform-column";

type ValueReader = (item: ObjectItem, props: ColumnsType) => string | boolean | number;
type ReadersByType = Record<ShowContentAsEnum, ValueReader>;
type RowData = Record<string, string | number | boolean>;
type RowReader = (item: ObjectItem) => RowData;

const readers: ReadersByType = {
    attribute(item, props) {
        if (props.attribute === undefined) {
            return "";
        }

        const data = props.attribute.get(item);

        if (data.status !== "available") {
            return "";
        }

        if (typeof data.value === "boolean") {
            return data.value;
        }

        if (data.value instanceof Big) {
            return data.value.toNumber();
        }

        return data.displayValue;
    },

    dynamicText(item, props) {
        if (props.dynamicText === undefined) {
            return "";
        }

        const data = props.dynamicText.get(item);

        switch (data.status) {
            case "available":
                return data.value;
            case "unavailable":
                return "n/a";
            default:
                return "";
        }
    },

    customContent(item, props) {
        return props.exportValue?.get(item).value ?? "";
    }
};

function createRowReader(columns: ColumnsType[]): RowReader {
    return item =>
        columns.reduce((prev, col): RowData => {
            const transformedCol = transformColumn(col);
            return {
                ...prev,
                [transformedCol.field]: readers[col.showContentAs](item, col)
            };
        }, {} as RowData);
}

export function transformData(data: ObjectItem[], columns: ColumnsType[]): RowData[] {
    return data.map(createRowReader(columns));
}
