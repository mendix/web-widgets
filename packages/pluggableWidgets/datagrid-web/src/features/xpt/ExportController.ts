import { ListValue } from "mendix";
import { createNanoEvents, Emitter } from "nanoevents";
import { ColumnsType } from "../../../typings/DatagridProps";
import { DSExportRequest } from "./DSExportRequest";
import { ProgressStore } from "./ProgressStore";

interface ControllerEvents {
    sourcechange: (ds: ListValue) => void;
    propertieschange: (columns: ColumnsType[]) => void;
    exportcolumns: (columns: number[]) => void;
    abort: () => void;
}

type RequestHandler = (req: DSExportRequest) => void;

export class ExportController {
    private datasource: ListValue | null = null;
    private exportColumns: number[] = [];
    private allColumns: ColumnsType[] = [];
    private emitter: Emitter<ControllerEvents>;
    private locked = false;

    constructor(private progressStore: ProgressStore) {
        this.emitter = createNanoEvents();
        this.emitter.on("exportcolumns", this.onexportcolumns);
        this.emitter.on("propertieschange", this.onpropertieschange);
        this.emitter.on("sourcechange", this.onsourcechange);
    }

    emit<K extends keyof ControllerEvents>(event: K, ...args: Parameters<ControllerEvents[K]>): void {
        this.emitter.emit(event, ...args);
    }

    onexportcolumns = (columns: number[]): void => {
        if (this.locked === false) {
            this.exportColumns = columns;
        }
    };

    onsourcechange = (ds: ListValue): void => {
        this.datasource = ds;
    };

    onpropertieschange = (allColumns: ColumnsType[]): void => {
        this.allColumns = allColumns;
    };

    async exportData(handler: RequestHandler, options: { limit?: number; withHeaders?: boolean } = {}): Promise<void> {
        if (this.datasource === null) {
            console.error("Export controller: datasource is missing.");
            return;
        }
        if (this.allColumns.length === 0 || this.exportColumns.length === 0) {
            console.error("Export controller: no columns to export.");
        }

        const exportColumns = this.exportColumns.slice();
        const pickColumns = (cols: ColumnsType[]): ColumnsType[] => exportColumns.map(index => cols[index]);
        const snapshot = { offset: this.datasource.offset, limit: this.datasource.limit };

        this.locked = true;
        let req: DSExportRequest | null = new DSExportRequest({
            ds: this.datasource,
            columns: pickColumns(this.allColumns),
            ...options
        });

        // Connect progress store
        req.on("loadstart", this.progressStore.onloadstart);
        req.on("progress", this.progressStore.onprogress);
        req.on("loadend", this.progressStore.onloadend);

        // Connect to widget events
        const bindings = [
            this.emitter.on("sourcechange", req.onsourcechange),
            this.emitter.on("propertieschange", cols => req?.onpropertieschange(pickColumns(cols))),
            this.emitter.on("abort", req.abort)
        ];

        handler(req);
        await req.send();

        // Cleanup and unsubscribe
        bindings.forEach(unsubscribe => unsubscribe());
        req = null;
        this.locked = false;
        this.datasource.setLimit(snapshot.limit);
        this.datasource.setOffset(snapshot.offset);
        this.datasource.reload();
    }

    abort = (): void => this.emitter.emit("abort");
}
