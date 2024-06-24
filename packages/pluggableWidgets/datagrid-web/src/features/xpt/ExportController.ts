import { useState, useEffect } from "react";
import { ListValue } from "mendix";
import { createNanoEvents, Emitter } from "nanoevents";
import { ColumnsType, DatagridContainerProps } from "../../../typings/DatagridProps";
import { IColumnGroupStore } from "../../helpers/state/ColumnGroupStore";
import { DSExportRequest } from "./DSExportRequest";
import { ProgressStore } from "./ProgressStore";

interface ControllerEvents {
    sourcechange: (ds: ListValue) => void;
    propertieschange: (columns: ColumnsType[]) => void;
    exportcolumns: (columns: number[]) => void;
    abort: () => void;
}
class ExportController {
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

    async exportData(): Promise<void> {
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
        let req: DSExportRequest | null = new DSExportRequest(this.datasource, pickColumns(this.allColumns));
        let data: any[] = [];

        // Connect progress store
        req.on("loadstart", this.progressStore.onloadstart);
        req.on("progress", this.progressStore.onprogress);
        req.on("loadend", this.progressStore.onloadend);
        req.on("data", chunk => (data = data.concat(chunk)));

        // Connect to widget events
        const bindings = [
            this.emitter.on("sourcechange", req.onsourcechange),
            this.emitter.on("propertieschange", cols => req?.onpropertieschange(pickColumns(cols))),
            this.emitter.on("abort", req.abort)
        ];

        await req.send();

        // Cleanup and unsubscribe
        bindings.forEach(unsubscribe => unsubscribe());
        req = null;
        this.locked = false;
        this.datasource.setLimit(snapshot.limit);
        this.datasource.setOffset(snapshot.offset);
        this.datasource.reload();
        console.log("export data: done.", data);
    }

    abort = (): void => this.emitter.emit("abort");
}

export function useDSExport(
    props: DatagridContainerProps,
    columnsStore: IColumnGroupStore
): [store: ProgressStore, abort: () => void] {
    const [progress] = useState(() => new ProgressStore());
    const [controller] = useState(() => new ExportController(progress));

    useEffect(() => controller.abort, [controller]);

    useEffect((): (() => void) => {
        (window as any).__xpt = controller;
        return () => {
            (window as any).__xpt = null;
        };
    }, [controller]);

    useEffect(() => {
        controller.emit("sourcechange", props.datasource);
    }, [props.datasource, controller]);

    useEffect(() => {
        controller.emit("propertieschange", props.columns);
    }, [props.columns, controller]);

    useEffect(() => {
        controller.emit(
            "exportcolumns",
            columnsStore.visibleColumns.map(col => col.columnIndex)
        );
    }, [columnsStore.visibleColumns, controller]);

    return [progress, controller.abort];
}
