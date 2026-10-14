import { Big } from "big.js";
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
        z: format
    };
}

const FALLBACK_DATE_FORMAT = "dd-mm-yyyy";

function getDefaultDateFormat(): string {
    const pattern = window.mx?.session.getConfig().locale.patterns.date;
    if (!pattern) {
        return FALLBACK_DATE_FORMAT;
    }
    return pattern.replace(/M/g, "m");
}

export function excelDate(value: Date, format?: string): ExcelCell {
    return {
        t: "d",
        v: value,
        z: format ?? getDefaultDateFormat()
    };
}

export function excelBoolean(value: boolean): ExcelCell {
    return {
        t: "b",
        v: value
    };
}

function hasTimeComponent(format: string): boolean {
    // Strip locale tags like [$-en-US] before checking — "S" in locale codes would otherwise match.
    const stripped = format.replace(/\[.*?\]/g, "");
    return /[hs]/i.test(stripped);
}

/**
 * SheetJS turns a `t: "d"` cell into a sheet serial by reading the `Date`'s **UTC** fields, while
 * the grid renders the same value using its local fields. A `Date` handed over by the Mendix client
 * is local-anchored (`new Date(2007, 0, 1)`), so passing it through unchanged exports the session's
 * UTC offset as a stray time — and, once the time is stripped, the previous calendar day.
 *
 * Re-anchoring the local fields onto UTC makes the cell carry exactly the wall clock the grid shows,
 * independent of the offset or DST rule in effect.
 */
function toExcelWallClock(date: Date): Date {
    return new Date(
        Date.UTC(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            date.getHours(),
            date.getMinutes(),
            date.getSeconds(),
            date.getMilliseconds()
        )
    );
}

/** Expects a UTC-anchored date, as produced by {@link toExcelWallClock}. */
function stripTime(date: Date): Date {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

const EXPLICIT_ZONE = /(?:Z|[+-]\d{2}:?\d{2})$/i;
/** Date-only ISO forms (`YYYY`, `YYYY-MM`, `YYYY-MM-DD`), which ECMAScript parses as UTC. */
const DATE_ONLY_ISO = /^\d{4}(?:-\d{2}(?:-\d{2})?)?$/;

/**
 * Parses an exported date string into a UTC-anchored date. A string that names a zone — or a
 * date-only ISO string, which ECMAScript defines as UTC — already resolves to an instant whose UTC
 * fields are the wall clock it asked for. Anything else is parsed by the browser in local time, so
 * its fields need re-anchoring.
 */
function parseExportDate(value: string): Date | undefined {
    const parsed = new Date(value);
    if (isNaN(parsed.getTime())) {
        return undefined;
    }
    const trimmed = value.trim();
    return EXPLICIT_ZONE.test(trimmed) || DATE_ONLY_ISO.test(trimmed) ? parsed : toExcelWallClock(parsed);
}

const MAX_SAFE_SIGNIFICANT_DIGITS = 15;

function countSignificantDigits(value: Big): number {
    const str = value.toFixed();
    const unsigned = str.replace("-", "");
    const noDecimal = unsigned.replace(".", "");
    const stripped = noDecimal.replace(/^0+/, "");
    return stripped.length || 1;
}

function countDecimalPlaces(value: Big): number {
    const fixed = value.toFixed();
    const dot = fixed.indexOf(".");
    return dot === -1 ? 0 : fixed.length - dot - 1;
}

function getAttributeDefaultFormat(props: ColumnsType, value: unknown): string | undefined {
    const formatter = props.attribute?.formatter;
    if (!formatter) {
        return undefined;
    }

    if (formatter.type === "datetime") {
        const cfg = formatter.config;
        return cfg.type === "custom" ? cfg.pattern.replace(/M/g, "m") : undefined;
    }

    if (formatter.type === "number") {
        const cfg = formatter.config;
        const base = cfg.groupDigits ? "#,##0" : "0";
        // Mendix Decimal attributes do not expose a fixed `decimalPrecision` on the
        // formatter config at runtime (only `groupDigits`). Honour it when present,
        // otherwise mirror the grid by taking the decimal count from the value itself.
        // A per-value count (rather than a `0.########` mask) is required because a
        // static fractional mask emits a trailing dot for whole numbers (1983 -> "1983.").
        const decimals =
            cfg.decimalPrecision != null ? cfg.decimalPrecision : value instanceof Big ? countDecimalPlaces(value) : 0;
        return decimals > 0 ? `${base}.${"0".repeat(decimals)}` : base;
    }

    return undefined;
}

const readers: ReadersByType = {
    attribute(item, props) {
        const data = props.attribute?.get(item);

        if (data?.status !== "available") {
            return makeEmptyCell();
        }

        const value = data.value;
        const format =
            props.exportType === "default"
                ? getAttributeDefaultFormat(props, value)
                : getCellFormat({
                      exportType: props.exportType,
                      exportDateFormat: props.exportDateFormat,
                      exportNumberFormat: props.exportNumberFormat
                  });

        if (value instanceof Date) {
            const wallClock = toExcelWallClock(value);
            const dateValue = format && hasTimeComponent(format) ? wallClock : stripTime(wallClock);
            return excelDate(dateValue, format);
        }

        if (typeof value === "boolean") {
            return excelBoolean(value);
        }

        // Mendix numeric attributes always surface as Big; plain JS number is not expected here.
        if (value instanceof Big) {
            if (countSignificantDigits(value) > MAX_SAFE_SIGNIFICANT_DIGITS) {
                return excelString(value.toFixed(), format);
            }
            return excelNumber(value.toNumber(), format);
        }

        return excelString(data.displayValue ?? "");
    },

    dynamicText(item, props) {
        const data = props.dynamicText?.get(item);

        switch (data?.status) {
            case "available":
                return excelString(data.value ?? "");
            case "unavailable":
                return excelString("n/a");
            default:
                return makeEmptyCell();
        }
    },

    customContent(item, props) {
        const raw = props.exportValue?.get(item);
        if (!raw || raw.status !== "available") {
            return makeEmptyCell();
        }
        const value = raw.value ?? "";
        const { exportType } = props;
        const format = getCellFormat({
            exportType,
            exportDateFormat: props.exportDateFormat,
            exportNumberFormat: props.exportNumberFormat
        });

        if (exportType === "number" && value.trim() !== "") {
            const parsed = Number(value);
            if (!Number.isNaN(parsed)) {
                return excelNumber(parsed, format);
            }
        }

        if (exportType === "date" && value !== "") {
            const parsed = parseExportDate(value);
            if (parsed) {
                const dateValue = format && hasTimeComponent(format) ? parsed : stripTime(parsed);
                return excelDate(dateValue, format);
            }
        }

        if (exportType === "boolean") {
            const lower = value.trim().toLowerCase();
            if (lower === "true" || lower === "yes" || lower === "1") {
                return excelBoolean(true);
            }
            if (lower === "false" || lower === "no" || lower === "0") {
                return excelBoolean(false);
            }
        }

        return excelString(value);
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
