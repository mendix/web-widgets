import { isAvailable } from "@mendix/widget-plugin-platform/framework/is-available";
import Big from "big.js";
import { DynamicValue, ListValue, ObjectItem, ValueStatus } from "mendix";
import { createNanoEvents, Emitter, Unsubscribe } from "nanoevents";
import { ColumnsType, ShowContentAsEnum } from "../../../typings/DatagridProps";

/** Represents a single Excel cell (SheetJS compatible) */
interface ExcelCell {
    /** Cell type: 's' = string, 'n' = number, 'b' = boolean, 'd' = date */
    t: "s" | "n" | "b" | "d";
    /** Underlying value */
    v: string | number | boolean | Date;
    /** Optional Excel number/date format, e.g. "yyyy-mm-dd" or "$0.00" */
    z?: string;
    /** Optional pre-formatted display text */
    w?: string;
}

type RowData = ExcelCell[];

type HeaderDefinition = {
    name: string;
    type: string;
};

type ValueReader = (item: ObjectItem, props: ColumnsType) => ExcelCell;

type ReadersByType = Record<ShowContentAsEnum, ValueReader>;

type RowReader = (item: ObjectItem) => RowData;

type ColumnReader = (props: ColumnsType) => HeaderDefinition;

interface ExportRequestEvents {
    /** Emitted once when request is started. */
    loadstart: (pe: ProgressEvent) => void;
    /** Emitted once before "data" events. */
    headers: (columns: HeaderDefinition[]) => void;
    /** Emitted every time new chunk is available. */
    data: (chunk: RowData[]) => void;
    /** Emitted every time new chunk is sent. */
    progress: (pe: ProgressEvent) => void;
    /** Emitted if abort method is called. */
    abort: (pe: ProgressEvent) => void;
    /** Emitted when no more data is available. */
    end: (pe: ProgressEvent) => void;
    /** Emitted at the end of the request. */
    loadend: (pe: ProgressEvent) => void;
}

type ExportRequestStatus = "idle" | "awaiting" | "reading" | "sending" | "end" | "aborted";

interface RequestParams {
    ds: ListValue;
    columns: ColumnsType[];
    withHeaders?: boolean;
    limit?: number;
}

export class DSExportRequest {
    private _status: ExportRequestStatus = "idle";
    private datasource: ListValue;
    private columns: ColumnsType[];
    private offset = 0;
    private loaded = 0;
    private limit = 10;
    private totalCount: number | undefined = undefined;
    private shouldSendHeaders = false;
    private emitter: Emitter<ExportRequestEvents>;
    private getters: Array<{ get: (item: unknown) => { status: ValueStatus } }> = [];
    private readController: AbortController | undefined;

    constructor(params: RequestParams) {
        const { ds, columns, withHeaders = false, limit = 0 } = params;
        this.limit = Math.max(limit, this.limit);
        this.emitter = createNanoEvents();
        this.datasource = ds;
        this.totalCount = ds.totalCount;
        this.columns = columns;
        this.getters = this.getGetters(columns);
        this.shouldSendHeaders = withHeaders;
    }

    get status(): ExportRequestStatus {
        return this._status;
    }

    on<K extends keyof ExportRequestEvents>(event: K, cb: ExportRequestEvents[K]): Unsubscribe {
        return this.emitter.on(event, cb);
    }

    private emitLoadStart(): void {
        this.emitter.emit("loadstart", this.createProgressEvent("loadstart"));
    }

    private emitHeaders(headers: HeaderDefinition[]): void {
        this.emitter.emit("headers", headers);
    }

    private emitData(chunk: RowData[]): void {
        this.emitter.emit("data", chunk);
    }

    private emitProgress(): void {
        this.emitter.emit("progress", this.createProgressEvent("progress"));
    }

    private emitAbort(): void {
        this.emitter.emit("abort", this.createProgressEvent("abort"));
    }

    private emitEnd(): void {
        this.emitter.emit("end", this.createProgressEvent("end"));
    }

    private emitLoadEnd(): void {
        this.emitter.emit("loadend", this.createProgressEvent("loadend"));
    }

    private createProgressEvent(type: string): ProgressEvent {
        return new ProgressEvent(type, {
            lengthComputable: typeof this.totalCount === "number",
            loaded: this.loaded,
            total: this.totalCount
        });
    }

    send = (): Promise<void> => {
        this.emitLoadStart();
        this._status = "awaiting";
        this.offset = 0;
        this.datasource.setLimit(this.limit);
        this.datasource.setOffset(this.offset);
        this.datasource.reload();
        return new Promise(res => this.on("loadend", () => res()));
    };

    abort = (): void => {
        this._status = "aborted";
        this.readController?.abort();
        this.emitAbort();
        this.emitLoadEnd();
        this.dispose();
    };

    onsourcechange = (ds: ListValue): void => {
        const isReady = ds.offset === this.offset && ds.limit === this.limit && ds.status === "available";
        if (this._status === "awaiting" && isReady) {
            this.datasource = ds;
            if (this.shouldSendHeaders) {
                this.sendHeaders();
                this.shouldSendHeaders = false;
            }
            this.read();
        }
    };

    onpropertieschange = (columns: ColumnsType[]): void => {
        if (this._status === "reading") {
            this.columns = columns;
            this.getters = this.getGetters(columns);
            this.read();
        }
    };

    private sendHeaders(): void {
        const reader: ColumnReader = column => ({
            name: column.header && isAvailable(column.header) ? (column.header.value?.toString() ?? "") : "",
            type: column.attribute?.type.toString() ?? ""
        });

        const headers = this.columns.map(reader);

        this.emitHeaders(headers);
    }

    private async read(): Promise<void> {
        this._status = "reading";

        if (this.readController) {
            this.readController.abort();
            this.readController = undefined;
        }

        const { items = [] } = this.datasource;
        const scheduler = createScheduler();
        const controller = new AbortController();
        this.readController = controller;

        const batchSize = 100;
        const len = items.length;
        let isReady = true;
        let index = 0;

        while (index < len && !controller.signal.aborted) {
            const end = Math.min(index + batchSize, len);

            for (; index < end; index++) {
                for (const prop of this.getters) {
                    isReady &&= prop.get(items[index]).status !== "loading";
                }
            }

            await scheduler.yield();
        }

        this.readController = undefined;

        if (!isReady || controller.signal.aborted) {
            return;
        }

        this.finalizeRead(items);
    }

    private finalizeRead(items: ObjectItem[]): void {
        const chunk = readChunk(items, this.columns);
        this.sendChunk(chunk);

        if (this.datasource.hasMoreItems) {
            this.fetchNext();
        } else {
            this.end();
        }
    }

    private sendChunk(chunk: RowData[]): void {
        this._status = "sending";
        this.loaded += chunk.length;
        this.emitData(chunk);
        this.emitProgress();
    }

    private fetchNext(): void {
        this._status = "awaiting";
        this.offset += this.limit;
        this.datasource.setOffset(this.offset);
    }

    private end(): void {
        this._status = "end";
        this.emitEnd();
        this.emitLoadEnd();
        this.dispose();
    }

    private dispose(): void {
        this.emitter.events = {};
    }

    private getGetters(columns: ColumnsType[]): Array<{ get: (item: unknown) => { status: ValueStatus } }> {
        return columns.map(col => {
            let prop =
                col.showContentAs === "attribute"
                    ? col.attribute
                    : col.showContentAs === "dynamicText"
                      ? col.dynamicText
                      : col.exportValue;
            prop ??= { get: () => ({ status: ValueStatus.Available, value: "n/a" }) };
            return prop;
        });
    }
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

        return excelString(value, format);
    }
};

function makeEmptyCell(): ExcelCell {
    return { t: "s", v: "" };
}

function excelNumber(value: number, format?: string): ExcelCell {
    return {
        t: "n",
        v: value,
        z: format
    };
}

function excelString(value: string, format?: string): ExcelCell {
    return {
        t: "s",
        v: value,
        z: format ?? undefined
    };
}

function excelDate(value: string | Date, format?: string): ExcelCell {
    return {
        t: format === undefined ? "s" : "d",
        v: value,
        z: format
    };
}

function excelBoolean(value: boolean): ExcelCell {
    return {
        t: "b",
        v: value,
        w: value ? "TRUE" : "FALSE"
    };
}

interface DataExportProps {
    exportType: "default" | "number" | "date" | "boolean";
    exportDateFormat?: DynamicValue<string>;
    exportNumberFormat?: DynamicValue<string>;
}

function getCellFormat({ exportType, exportDateFormat, exportNumberFormat }: DataExportProps): string | undefined {
    switch (exportType) {
        case "date":
            return exportDateFormat?.status === "available" ? exportDateFormat.value : undefined;
        case "number":
            return exportNumberFormat?.status === "available" ? exportNumberFormat.value : undefined;
        default:
            return undefined;
    }
}

function createRowReader(columns: ColumnsType[]): RowReader {
    return item =>
        columns.map(col => {
            return readers[col.showContentAs](item, col);
        });
}

function readChunk(data: ObjectItem[], columns: ColumnsType[]): RowData[] {
    return data.map(createRowReader(columns));
}

declare global {
    interface Window {
        scheduler: {
            yield(): Promise<void>;
        };
    }
}

function createScheduler(): { yield(): Promise<void> } {
    if (window.scheduler?.yield) {
        return {
            async yield() {
                return window.scheduler.yield();
            }
        };
    }
    return {
        async yield() {
            return new Promise<void>(res => setTimeout(res));
        }
    };
}
