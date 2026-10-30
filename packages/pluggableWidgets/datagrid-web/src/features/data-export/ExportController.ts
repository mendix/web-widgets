import { ListValue } from "mendix";
import { createNanoEvents, Emitter, Unsubscribe } from "nanoevents";
import { TaskProgressService } from "@mendix/widget-plugin-grid/main";
import { DSExportRequest } from "./DSExportRequest";
import { ColumnsType } from "../../../typings/DatagridProps";

export type BeforeExportArgs = {
    gridName: string;
    columnTitles: string;
    chunkSize: number;
    fileName: string;
    sheetName: string;
    startTime: Date;
};

export type AfterExportArgs = BeforeExportArgs & {
    exportedItemCount: number;
    status: "success" | "aborted";
    endTime: Date;
};

interface ControllerEvents {
    sourcechange: (ds: ListValue) => void;
    propertieschange: (ps: ColumnsType[]) => void;
    columnschange: (columns: number[]) => void;
    exportend: () => void;
    abort: () => void;
    beforeexport: (args: BeforeExportArgs) => void;
    afterexport: (args: AfterExportArgs) => void;
}

type RequestHandler = (req: DSExportRequest) => void;

export class ExportController {
    private datasource: ListValue | null = null;
    private columns: number[] = [];
    private properties: ColumnsType[] = [];
    private emitter: Emitter<ControllerEvents>;
    private locked = false;
    private progressStore: TaskProgressService;
    private name: string;

    constructor(name: string, progress: TaskProgressService) {
        this.name = name;
        this.progressStore = progress;
        this.emitter = createNanoEvents();
        this.emitter.on("columnschange", this.oncolumnschange);
        this.emitter.on("propertieschange", this.onpropertieschange);
        this.emitter.on("sourcechange", this.onsourcechange);
    }

    emit<K extends keyof ControllerEvents>(event: K, ...args: Parameters<ControllerEvents[K]>): void {
        this.emitter.emit(event, ...args);
    }

    on<K extends keyof ControllerEvents>(event: K, handler: ControllerEvents[K]): Unsubscribe {
        return this.emitter.on(event, handler);
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

    async exportData(
        handler: RequestHandler,
        options: { limit?: number; withHeaders?: boolean; fileName?: string; sheetName?: string } = {}
    ): Promise<void> {
        if (this.datasource === null) {
            console.error("Export controller: datasource is missing.");
            return;
        }
        if (this.properties.length === 0 || this.columns.length === 0) {
            console.error("Export controller: no columns to export.");
        }

        const filter = this.createFilter(this.columns.slice());
        const filteredColumns = filter(this.properties);
        const snapshot = { offset: this.datasource.offset, limit: this.datasource.limit };

        const columnTitles = filteredColumns.map(c => c.header?.value ?? "").join(",");
        const fileName = options.fileName ?? "";
        const sheetName = options.sheetName ?? "";

        this.locked = true;
        let req: DSExportRequest | null = new DSExportRequest({
            ds: this.datasource,
            columns: filteredColumns,
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

        const startTime = new Date();
        const chunkSize = req.limit;
        this.emitter.emit("beforeexport", {
            gridName: this.name,
            columnTitles,
            chunkSize,
            fileName,
            sheetName,
            startTime
        });

        handler(req);

        await req.send();

        const endTime = new Date();
        const exportedItemCount = req.loaded;
        const status = req.status === "end" ? "success" : "aborted";
        this.emitter.emit("afterexport", {
            gridName: this.name,
            columnTitles,
            chunkSize,
            fileName,
            sheetName,
            exportedItemCount,
            status,
            startTime,
            endTime
        });

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
