import Big from "big.js";
import { DynamicValue, ObjectItem } from "mendix";
import { ColumnsType, ShowContentAsEnum } from "../../../typings/DatagridProps";

/** Represents a single Excel cell (SheetJS compatible) */
export interface ExcelCell {
    /** Cell type: 's' = string, 'n' = number, 'b' = boolean, 'd' = date */
    t: "s" | "n" | "b" | "d";
    /** Underlying value */
    v: string | number | boolean | Date;
    /** Optional Excel number/date format, e.g. "yyyy-mm-dd" or "$0.00" */
    z?: string;
    /** Optional pre-formatted display text */
    w?: string;
}

export type RowData = ExcelCell[];

export type HeaderDefinition = {
    name: string;
    type: string;
};

type ValueReader = (item: ObjectItem, props: ColumnsType) => ExcelCell;

type ReadersByType = Record<ShowContentAsEnum, ValueReader>;

type RowReader = (item: ObjectItem) => RowData;

export interface DataExportProps {
    exportType: "default" | "number" | "date" | "boolean";
    exportDateFormat?: DynamicValue<string>;
    exportNumberFormat?: DynamicValue<string>;
}

export function getCellFormat({
    exportType,
    exportDateFormat,
    exportNumberFormat
}: DataExportProps): string | undefined {
    switch (exportType) {
        case "date":
            return exportDateFormat?.status === "available" ? exportDateFormat.value : undefined;
        case "number":
            return exportNumberFormat?.status === "available" ? exportNumberFormat.value : undefined;
        default:
            return undefined;
    }
}

export function makeEmptyCell(): ExcelCell {
    return { t: "s", v: "" };
}

export function excelNumber(value: number, format?: string): ExcelCell {
    return {
        t: "n",
        v: value,
        z: format
    };
}

export function excelString(value: string, format?: string): ExcelCell {
    return {
        t: "s",
        v: value,
        z: format ?? undefined
    };
}

export function excelDate(value: string | Date, format?: string): ExcelCell {
    return {
        t: format === undefined ? "s" : "d",
        v: value,
        z: format
    };
}

export function excelBoolean(value: boolean): ExcelCell {
    return {
        t: "b",
        v: value,
        w: value ? "TRUE" : "FALSE"
    };
}

const readers: ReadersByType = {
    attribute(item, props) {
        const data = props.attribute?.get(item);

        if (data?.status !== "available") {
            return makeEmptyCell();
        }

        const value = data.value;
        const format = getCellFormat({
            exportType: props.exportType,
            exportDateFormat: props.exportDateFormat,
            exportNumberFormat: props.exportNumberFormat
        });

        if (value instanceof Date) {
            return excelDate(format === undefined ? data.displayValue : value, format);
        }

        if (typeof value === "boolean") {
            return excelBoolean(value);
        }

        if (value instanceof Big || typeof value === "number") {
            const num = value instanceof Big ? value.toNumber() : value;
            return excelNumber(num, format);
        }

        return excelString(data.displayValue ?? "");
    },

    dynamicText(item, props) {
        const data = props.dynamicText?.get(item);

        switch (data?.status) {
            case "available":
                const format = getCellFormat({
                    exportType: props.exportType,
                    exportDateFormat: props.exportDateFormat,
                    exportNumberFormat: props.exportNumberFormat
                });

                return excelString(data.value ?? "", format);
            case "unavailable":
                return excelString("n/a");
            default:
                return makeEmptyCell();
        }
    },

    customContent(item, props) {
        const value = props.exportValue?.get(item).value ?? "";
        const format = getCellFormat({
            exportType: props.exportType,
            exportDateFormat: props.exportDateFormat,
            exportNumberFormat: props.exportNumberFormat
        });

        if (props.exportType === "number" && value !== "") {
            const parsed = Number(value);
            if (!Number.isNaN(parsed)) {
                return excelNumber(parsed, format);
            }
        }

        return excelString(value, format);
    }
};

function createRowReader(columns: ColumnsType[]): RowReader {
    return item =>
        columns.map(col => {
            return readers[col.showContentAs](item, col);
        });
}

export function readChunk(data: ObjectItem[], columns: ColumnsType[]): RowData[] {
    return data.map(createRowReader(columns));
}
