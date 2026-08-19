import { Big } from "big.js";
import { useCallback, useEffect, useState } from "react";
import { TaskProgressService } from "@mendix/widget-plugin-grid/main";
import { ExportController } from "./ExportController";
import { getExportRegistry } from "./registry";
import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { IColumnGroupStore } from "../../helpers/state/ColumnGroupStore";

type ResourceEntry = {
    key: string;
    controller: ExportController;
};

type Props = Pick<DatagridContainerProps, "name" | "datasource" | "columns" | "onBeforeExport" | "onAfterExport">;

export function useDataExport(
    props: Props,
    columnsStore: IColumnGroupStore,
    progress: TaskProgressService
): [abort: () => void] {
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

    useEffect(() => {
        const action = props.onBeforeExport;
        if (!action) {
            entry?.controller.setOnBeforeExport(undefined);
            return;
        }
        entry?.controller.setOnBeforeExport(args => {
            if (action.canExecute) {
                action.execute({
                    gridName: args.gridName,
                    columnTitles: args.columnTitles,
                    chunkSize: new Big(args.chunkSize),
                    fileName: args.fileName,
                    sheetName: args.sheetName,
                    startTime: args.startTime
                });
            }
        });
    }, [entry, props.onBeforeExport]);

    useEffect(() => {
        const action = props.onAfterExport;
        if (!action) {
            entry?.controller.setOnAfterExport(undefined);
            return;
        }
        entry?.controller.setOnAfterExport(args => {
            if (action.canExecute) {
                action.execute({
                    gridName: args.gridName,
                    columnTitles: args.columnTitles,
                    chunkSize: new Big(args.chunkSize),
                    fileName: args.fileName,
                    sheetName: args.sheetName,
                    exportedItemCount: new Big(args.exportedItemCount),
                    status: args.status,
                    startTime: args.startTime,
                    endTime: args.endTime
                });
            }
        });
    }, [entry, props.onAfterExport]);

    return [abort];
}

function createEntry(name: string, progress: TaskProgressService): ResourceEntry {
    return {
        key: name,
        controller: new ExportController(name, progress)
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
