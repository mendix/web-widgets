import { useCallback, useEffect, useState } from "react";
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
    columnsStore: IColumnGroupStore,
    progress: ProgressStore
): [store: ProgressStore, abort: () => void] {
    const [entry] = useState(() => createEntry(props.name, progress));
    const abort = useCallback(() => entry?.controller.abort(), [entry]);

    // Remove entry when widget unmounted.
    useEffect(() => {
        addController(entry);
        return () => {
            entry?.controller.abort();
            removeController(entry);
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
            "columnschange",
            columnsStore.visibleColumns.map(col => col.columnIndex)
        );
    }, [columnsStore.visibleColumns, entry]);

    return [progress, abort];
}

function createEntry(name: string, progress: ProgressStore): ResourceEntry {
    return {
        key: name,
        controller: new ExportController(progress)
    };
}

function addController(entry: ResourceEntry): void {
    const registry = getExportRegistry();

    // this overrides existing entries
    // but this is expected behaviour, the last one wins.
    // In the scenario where a new page has a data grid
    // with the same name and gets mounted while the old one
    // is not yet unmounted the new one has to win.
    registry.set(entry.key, entry.controller);
}

function removeController(entry: ResourceEntry | null): void {
    if (!entry) {
        return;
    }

    const registry = getExportRegistry();

    // only remove the exact controller we placed
    // it can happen that other grid has overridden the key
    // in this case we don't do anything.
    if (registry.get(entry.key) === entry.controller) {
        registry.delete(entry.key);
    }
}
