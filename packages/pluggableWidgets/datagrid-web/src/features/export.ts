import { useEffect, useRef, useReducer, Dispatch } from "react";
import { ObjectItem } from "mendix";
import { isAvailable } from "@mendix/widget-plugin-platform/framework/is-available";
import { ColumnsType } from "../../typings/DatagridProps";

export const DATAGRID_DATA_EXPORT = "com.mendix.widgets.web.datagrid.export" as const;
const MAX_LIMIT = 500;

export interface DataExporter {
    create(): DataExportStream;
}

export type DataGridName = string;

type ColumnDefinition = {
    name: string;
    type: string;
};

type RowDataType = string | number | boolean;

export type Message =
    | {
          type: "columns";
          payload: ColumnDefinition[];
      }
    | {
          type: "data";
          payload: RowDataType[][];
      }
    | {
          type: "end";
      }
    | {
          type: "aborted";
      };

interface SteamOptions {
    limit: number;
}

interface DataExportStream {
    process(cb: (msg: Message) => Promise<void> | void, options?: SteamOptions): void;
    start(): void;
    abort(): void;
}

export type UpdateDataSourceFn = (params: { offset?: number; limit?: number; reload?: boolean }) => void;

type UseDG2ExportApi = {
    columns: ColumnsType[];
    hasMoreItems: boolean;
    items?: ObjectItem[];
    name: string;
    offset: number;
    limit?: number;
    updateDataSource: UpdateDataSourceFn;
};

type UseExportAPIReturn = {
    exporting: boolean;
    items: ObjectItem[];
};

export const useDG2ExportApi = ({
    columns,
    hasMoreItems,
    items = [],
    name,
    offset,
    limit = Number.POSITIVE_INFINITY,
    updateDataSource
}: UseDG2ExportApi): UseExportAPIReturn => {
    const [state, dispatch] = useReducer(exportStateReducer, initState());
    const stateRef = useRef(state);

    // Keep params in sync with data source.
    useEffect(
        () =>
            dispatch({
                type: "DataSourceUpdate",
                payload: { items, offset, limit, hasMoreItems }
            }),
        [items, offset, limit, hasMoreItems]
    );

    // Run export flow on every state change
    useEffect(() => {
        if (state !== stateRef.current) {
            exportFlow(state, dispatch, updateDataSource);
            stateRef.current = state;
        }
    }, [state, updateDataSource]);

    useEffect(() => {
        if (!window[DATAGRID_DATA_EXPORT]) {
            window[DATAGRID_DATA_EXPORT] = {};
        }

        let dataExporterCleanup: () => void;
        const create = (): DataExportStream => {
            if (stateRef.current.exporting) {
                throw new Error("Data grid (Export): export stream is busy");
            }

            const dataExportStream: DataExportStream = {
                process: (callback: CallbackFunction, options) => {
                    const { limit = 200 } = options ?? {};
                    dispatch({ type: "Setup", payload: { callback, columns, limit: Math.min(limit, MAX_LIMIT) } });
                    dataExporterCleanup = () => callback({ type: "aborted" });
                },
                start: () => dispatch({ type: "Start" }),
                abort: () => dispatch({ type: "Abort" })
            };

            return dataExportStream;
        };

        window[DATAGRID_DATA_EXPORT][name] = { create };

        return () => {
            dataExporterCleanup();
            delete window[DATAGRID_DATA_EXPORT][name];
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { exporting: state.exporting, items: state.exporting ? state.snapshot.items : items ?? [] };
};

function exportColumns(columns: ColumnsType[]): Message {
    const exportColumns: ColumnDefinition[] = columns.map(column => ({
        name: column.header && isAvailable(column.header) ? column.header.value?.toString() ?? "" : "",
        type: column.attribute?.type.toString() ?? ""
    }));

    return { type: "columns", payload: exportColumns };
}

function exportData(data: ObjectItem[], columns: ColumnsType[]): Message {
    const items = data.map(item => {
        return columns.map(column => {
            let value = "";

            if (column.showContentAs === "attribute") {
                value = column.attribute?.get(item)?.displayValue ?? "";
            } else if (column.showContentAs === "dynamicText") {
                value = column.dynamicText?.get(item)?.value ?? "";
            } else {
                value = "n/a";
            }

            return value;
        });
    });

    return { type: "data", payload: items };
}

type CallbackFunction = (msg: Message) => Promise<void> | void;

interface DataSourceStateSnapshot {
    items: ObjectItem[];
    offset: number;
    limit: number;
}
interface BaseState {
    currentOffset: number;
    currentItems: ObjectItem[];
    currentLimit: number;
    hasMoreItems: boolean;
}

interface InitState extends BaseState {
    exporting: false;
    columns: null;
    snapshot: null;
    callback: null;
    phase: "awaitingCallback";
}

interface ReadyState extends BaseState {
    exporting: false;
    columns: ColumnsType[];
    snapshot: DataSourceStateSnapshot;
    callback: CallbackFunction;
    phase: "readyToStart";
}

interface WorkingState extends BaseState {
    exporting: true;
    columns: ColumnsType[];
    snapshot: DataSourceStateSnapshot;
    callback: CallbackFunction;
    phase: "resetOffset" | "exportColumns" | "awaitingData" | "exportData" | "finished" | "aborting" | "finally";
}

type State = WorkingState | ReadyState | InitState;

type Action =
    | {
          type: "DataSourceUpdate";
          payload: { offset: number; items: ObjectItem[]; hasMoreItems: boolean; limit: number };
      }
    | {
          type: "Setup";
          payload: { callback: CallbackFunction; columns: ColumnsType[]; limit: number };
      }
    | {
          type: "Start";
      }
    | {
          type: "Reset";
      }
    | {
          type: "PageExported";
      }
    | {
          type: "ColumnsExported";
      }
    | {
          type: "Finish";
      }
    | {
          type: "Abort";
      }
    | {
          type: "ExportEnd";
      };

function initState(): InitState {
    return {
        exporting: false,
        currentOffset: 0,
        currentItems: [],
        currentLimit: Number.POSITIVE_INFINITY,
        hasMoreItems: true,
        snapshot: null,
        callback: null,
        columns: null,
        phase: "awaitingCallback"
    };
}

function exportStateReducer(state: State, action: Action): State {
    if (action.type === "Reset") {
        return initState();
    }

    if (action.type === "DataSourceUpdate") {
        const currentPhase = state.phase;
        const next: State = {
            ...state,
            currentOffset: action.payload.offset,
            currentLimit: action.payload.limit,
            currentItems: action.payload.items,
            hasMoreItems: action.payload.hasMoreItems
        };

        if (next.exporting && currentPhase === "awaitingData") {
            next.phase = "exportData";
        }

        if (next.exporting && currentPhase === "resetOffset") {
            // Skip to finished if we have no items after resetting offset
            if (next.currentItems.length === 0) {
                next.phase = "finished";
            } else {
                next.phase = "exportData";
            }
        }

        if (next.exporting && currentPhase === "finished") {
            return {
                ...initState(),
                currentLimit: state.snapshot.limit,
                currentItems: state.snapshot.items,
                currentOffset: state.snapshot.offset
            };
        }

        return next;
    }

    if (action.type === "Setup" && state.phase === "awaitingCallback") {
        return {
            ...state,
            phase: "readyToStart",
            snapshot: {
                items: state.currentItems,
                offset: state.currentOffset,
                limit: state.currentLimit
            },
            callback: action.payload.callback,
            columns: action.payload.columns,
            currentLimit: action.payload.limit,
            currentOffset: 0
        };
    }

    if (action.type === "Start") {
        if (state.exporting) {
            return state;
        }

        if (state.phase === "readyToStart" && state.callback instanceof Function) {
            return {
                ...state,
                phase: "exportColumns",
                exporting: true
            };
        }

        throw new Error("Datagrid (Export): Export start failed: invalid state.");
    }

    if (action.type === "ColumnsExported") {
        if (state.exporting && state.phase === "exportColumns") {
            return { ...state, phase: "resetOffset" };
        }
    }

    if (action.type === "PageExported") {
        if (state.exporting && state.phase === "exportData") {
            return {
                ...state,
                phase: "awaitingData"
            };
        }
    }

    if (action.type === "Finish" && state.exporting) {
        return { ...state, phase: "finished" };
    }

    if (action.type === "Abort" && state.exporting) {
        return { ...state, phase: "aborting" };
    }

    if (action.type === "ExportEnd" && state.exporting) {
        return { ...state, phase: "finally" };
    }

    return state;
}

async function exportFlow(
    state: State,
    dispatch: Dispatch<Action>,
    updateDataSource: UpdateDataSourceFn
): Promise<void> {
    if (state.exporting === false) {
        return;
    }

    if (state.phase === "resetOffset") {
        updateDataSource({ offset: 0, limit: state.currentLimit, reload: true });
        return;
    }

    if (state.phase === "exportColumns") {
        const { columns, callback } = state;
        const datagridColumns = exportColumns(columns);
        await callback(datagridColumns);
        dispatch({ type: "ColumnsExported" });
        return;
    }

    if (state.phase === "exportData") {
        const { currentItems, callback, columns } = state;
        if (currentItems.length > 0) {
            await callback(exportData(currentItems, columns));
            dispatch({ type: "PageExported" });
        }
        return;
    }

    if (state.phase === "awaitingData") {
        const { currentOffset, currentLimit, hasMoreItems } = state;
        if (hasMoreItems) {
            updateDataSource({ offset: currentOffset + currentLimit });
        } else {
            dispatch({ type: "Finish" });
        }
        return;
    }

    if (state.phase === "aborting") {
        const { callback } = state;
        callback({ type: "aborted" });
        dispatch({ type: "ExportEnd" });
        return;
    }

    if (state.phase === "finished") {
        const { callback } = state;
        callback({ type: "end" });
        dispatch({ type: "ExportEnd" });
        return;
    }

    if (state.phase === "finally") {
        const { snapshot } = state;
        updateDataSource({
            offset: snapshot.offset,
            limit: snapshot.limit
        });
    }
}
