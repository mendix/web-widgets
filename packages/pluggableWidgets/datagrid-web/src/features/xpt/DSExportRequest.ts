import { ListValue } from "mendix";
import { Emitter, Unsubscribe, createNanoEvents } from "nanoevents";
import { ColumnsType } from "../../../typings/DatagridProps";

interface ExportRequestEvents {
    /** Emitted once when request is started. */
    loadstart: (pe: ProgressEvent) => void;
    /** Emitted every time new chunk is available. */
    data: (chunk: any[]) => void;
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

export class DSExportRequest {
    private _status: ExportRequestStatus = "idle";
    private datasource: ListValue;
    private columns: ColumnsType[];
    private offset = 0;
    private loaded = 0;
    private limit = 3;
    private totalCount: number | undefined = undefined;
    private emitter: Emitter<ExportRequestEvents>;

    constructor(ds: ListValue, columns: ColumnsType[]) {
        this.emitter = createNanoEvents();
        this.datasource = ds;
        this.totalCount = ds.totalCount;
        this.columns = columns;
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

    private emitData(chunk: any[]): void {
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

    send(): Promise<void> {
        this.emitLoadStart();
        this._status = "awaiting";
        this.offset = 0;
        this.datasource.setLimit(this.limit);
        this.datasource.setOffset(this.offset);
        this.datasource.reload();
        return new Promise(res => this.on("loadend", () => res()));
    }

    onsourcechange = (ds: ListValue): void => {
        const isReady = ds.offset === this.offset && ds.limit === this.limit && ds.status === "available";
        if (this._status === "awaiting" && isReady) {
            this.datasource = ds;
            this.read();
        }
    };

    onpropertieschange = (columns: ColumnsType[]): void => {
        if (this._status === "reading") {
            console.log("update columns");
            this.columns = columns;
            this.read();
        }
    };

    private read(): void {
        this._status = "reading";
        const { items = [] } = this.datasource;
        const isReady = items.every(item => {
            return this.columns.every(column => {
                let status: string | undefined;
                if (column.showContentAs === "attribute") {
                    status = column.attribute?.get(item).status;
                } else if (column.showContentAs === "dynamicText") {
                    status = column.dynamicText?.get(item).status;
                } else {
                    status = "available";
                }
                return status === "available";
            });
        });

        if (!isReady) {
            return;
        }

        const chunk = items.map(item => item.id);

        this.sendChunk(chunk);

        if (this.datasource.hasMoreItems) {
            this.fetchNext();
        } else {
            this.end();
        }
    }

    private sendChunk(chunk: any[]): void {
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

    abort(): void {
        this._status = "aborted";
        this.emitAbort();
        this.emitLoadEnd();
        this.dispose();
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
}
