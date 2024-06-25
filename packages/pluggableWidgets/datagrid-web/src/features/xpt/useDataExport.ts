import { useState, useEffect } from "react";
import { ExportController } from "./ExportController";
import { ProgressStore } from "./ProgressStore";
import { getExportRegistry } from "./registry";
import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { IColumnGroupStore } from "../../helpers/state/ColumnGroupStore";

type ResourceEntry = {
    key: string;
    controller: ExportController;
};

export function useDataExport(
    props: DatagridContainerProps,
    columnsStore: IColumnGroupStore
): [store: ProgressStore, abort: () => void] {
    const [progress] = useState(() => new ProgressStore());
    const [entry] = useState(() => regEntry(props.name, progress));

    // Remove entry when widget unmounted.
    useEffect(() => () => removeEntry(entry), [entry]);

    useEffect((): (() => void) => {
        (window as any).__xpt = entry?.controller;
        return () => {
            (window as any).__xpt = null;
        };
    }, [entry]);

    useEffect(() => {
        entry?.controller.emit("sourcechange", props.datasource);
    }, [props.datasource, entry]);

    useEffect(() => {
        entry?.controller.emit("propertieschange", props.columns);
    }, [props.columns, entry]);

    useEffect(() => {
        entry?.controller.emit(
            "exportcolumns",
            columnsStore.visibleColumns.map(col => col.columnIndex)
        );
    }, [columnsStore.visibleColumns, entry]);

    return [progress, () => {}];
}

function regEntry(name: string, progress: ProgressStore): ResourceEntry | null {
    const registry = getExportRegistry();

    if (registry.has(name)) {
        return null;
    }

    const entry = {
        key: name,
        controller: new ExportController(progress)
    };

    registry.set(entry.key, entry.controller);

    return entry;
}

function removeEntry(entry: ResourceEntry | null): void {
    if (entry) {
        entry.controller.abort();
        getExportRegistry().delete(entry.key);
    }
}
