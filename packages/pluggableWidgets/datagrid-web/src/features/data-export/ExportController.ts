import { ListValue } from "mendix";
import { createNanoEvents, Emitter } from "nanoevents";
import { ColumnsType } from "../../../typings/DatagridProps";
import { DSExportRequest } from "./DSExportRequest";
import { ProgressStore } from "./ProgressStore";

interface ControllerEvents {
    sourcechange: (ds: ListValue) => void;
    propertieschange: (ps: ColumnsType[]) => void;
    columnschange: (columns: number[]) => void;
    exportend: () => void;
    abort: () => void;
}

type RequestHandler = (req: DSExportRequest) => void;

export class ExportController {
    private datasource: ListValue | null = null;
    private columns: number[] = [];
    private properties: ColumnsType[] = [];
    private emitter: Emitter<ControllerEvents>;
    private locked = false;
    private progressStore: ProgressStore;

    constructor(progress: ProgressStore) {
        this.progressStore = progress;
        this.emitter = createNanoEvents();
        this.emitter.on("columnschange", this.oncolumnschange);
        this.emitter.on("propertieschange", this.onpropertieschange);
        this.emitter.on("sourcechange", this.onsourcechange);
    }

    emit<K extends keyof ControllerEvents>(event: K, ...args: Parameters<ControllerEvents[K]>): void {
        this.emitter.emit(event, ...args);
    }

    oncolumnschange = (columns: number[]): void => {
        if (this.locked === false) {
            this.columns = columns;
        }
    };

    onsourcechange = (ds: ListValue): void => {
        this.datasource = ds;
    };

    onpropertieschange = (ps: ColumnsType[]): void => {
        this.properties = ps;
    };

    connectProgress(req: DSExportRequest): void {
        req.on("loadstart", this.progressStore.onloadstart);
        req.on("progress", this.progressStore.onprogress);
        const unsub = this.emitter.on("exportend", () => {
            this.progressStore.onloadend();
            unsub();
        });
    }

    async exportData(handler: RequestHandler, options: { limit?: number; withHeaders?: boolean } = {}): Promise<void> {
        if (this.datasource === null) {
            console.error("Export controller: datasource is missing.");
            return;
        }
        if (this.properties.length === 0 || this.columns.length === 0) {
            console.error("Export controller: no columns to export.");
        }

        const filter = this.createFilter(this.columns.slice());
        const snapshot = { offset: this.datasource.offset, limit: this.datasource.limit };

        this.locked = true;
        let req: DSExportRequest | null = new DSExportRequest({
            ds: this.datasource,
            columns: filter(this.properties),
            ...options
        });

        // Connect progress store
        this.connectProgress(req);

        // Connect to controller events
        const requestBindings = [
            this.emitter.on("sourcechange", req.onsourcechange),
            this.emitter.on("propertieschange", properties => req?.onpropertieschange(filter(properties))),
            this.emitter.on("abort", req.abort)
        ];

        handler(req);
        await req.send();

        // Dispose request
        requestBindings.forEach(unsubscribe => unsubscribe());
        req = null;

        // Restore ds view state.
        this.datasource.setLimit(snapshot.limit);
        this.datasource.setOffset(snapshot.offset);
        this.datasource.reload();
        const unsub = this.emitter.on("sourcechange", ds => {
            const isRestored = ds.limit === snapshot.limit && ds.offset === snapshot.offset;
            if (isRestored) {
                this.emitter.emit("exportend");
                this.locked = false;
                unsub();
            }
        });
    }

    abort = (): void => this.emitter.emit("abort");

    createFilter(columns: number[]): (props: ColumnsType[]) => ColumnsType[] {
        const isExportable = (column: ColumnsType): boolean => {
            return column.showContentAs === "customContent" ? column.exportValue !== undefined : true;
        };

        return props => {
            return columns.map(index => props[index]).filter(isExportable);
        };
    }
}
