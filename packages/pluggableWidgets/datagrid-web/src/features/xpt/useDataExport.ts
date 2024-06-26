import { useState, useEffect, useCallback } from "react";
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
    const [entry] = useState(() => addController(props.name, progress));
    const abort = useCallback(() => entry?.controller.abort(), [entry]);

    // Remove entry when widget unmounted.
    useEffect(
        () => () => {
            entry?.controller.abort();
            removeController(entry);
        },
        [entry]
    );

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

function addController(name: string, progress: ProgressStore): ResourceEntry | null {
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

function removeController(entry: ResourceEntry | null): void {
    if (entry) {
        getExportRegistry().delete(entry.key);
    }
}
