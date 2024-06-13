import { InitState } from "./types";
export const DATAGRID_DATA_EXPORT = "com.mendix.widgets.web.datagrid.export" as const;
export const DEFAULT_LIMIT = 200;

export function initState(): InitState {
    return {
        callback: null,
        columns: null,
        currentItems: [],
        currentLimit: Number.POSITIVE_INFINITY,
        currentOffset: 0,
        exporting: false,
        hasMoreItems: true,
        phase: "awaitingCallback",
        processedRows: 0,
        snapshot: null
    };
}
