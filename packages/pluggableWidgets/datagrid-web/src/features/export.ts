import { useEffect, useMemo, useReducer, Dispatch } from "react";
import { ObjectItem } from "mendix";
import { isAvailable } from "@mendix/widget-plugin-platform/framework/is-available";
import { ColumnsType } from "../../typings/DatagridProps";

export const DATAGRID_DATA_EXPORT = "com.mendix.widgets.web.datagrid.export" as const;
const MAX_LIMIT = 500;
const DEFAULT_LIMIT = 200;

const _onOverwrite = Symbol("overwrite");

export interface DataExporter {
    create(): DataExportStream;
    [_onOverwrite]: () => void;
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

interface StreamOptions {
    limit: number;
}

interface DataExportStream {
    process(cb: (msg: Message) => Promise<void> | void, options?: StreamOptions): void;
    start(): void;
    abort(): void;
}

export type UpdateDataSourceFn = (params: { offset?: number; limit?: number; reload?: boolean }) => void;

type UseExportAPIProps = {
    columns: ColumnsType[];
    hasMoreItems: boolean;
    items?: ObjectItem[];
    name: string;
    offset: number;
    limit?: number;
    updateDataSource: UpdateDataSourceFn;
};

type UseExportAPIReturn = {
    currentLimit: number;
    exporting: boolean;
    items: ObjectItem[];
    processedRows: number;
};

type ExportAPIActions = {
    abort: () => void;
};

export const useDG2ExportApi = (props: UseExportAPIProps): [UseExportAPIReturn, ExportAPIActions] => {
    const [result, dispatch] = useExportMachine(props);

    useEffect(() => {
        if (!window[DATAGRID_DATA_EXPORT]) {
            window[DATAGRID_DATA_EXPORT] = {};
        }

        if (!window.DATAGRID_DATA_EXPORT) {
            window.DATAGRID_DATA_EXPORT = "";
        }

        let isOverwrittenByOtherDatagrid = false;
        let isBusy = false;
        let dataExporterCleanup: (() => void) | undefined;
        const exporter: DataExporter = {
            create() {
                if (isBusy) {
                    throw new Error("Data grid (Export): export stream is busy");
                }

                let isReady = false;
                const dataExportStream: DataExportStream = {
                    process: (externalCallback: CallbackFunction, options) => {
                        const { limit = DEFAULT_LIMIT } = options ?? {};

                        const callback: CallbackFunction = msg => {
                            if (msg.type === "aborted" || msg.type === "end") {
                                isBusy = false;
                                isReady = false;
                            }
                            externalCallback(msg);
                        };

                        dispatch({
                            type: "Setup",
                            payload: { callback, columns: props.columns, limit: Math.min(limit, MAX_LIMIT) }
                        });

                        dataExporterCleanup = () => {
                            if (isBusy) {
                                callback({ type: "aborted" });
                            }
                        };

                        isReady = true;
                    },
                    start: () => {
                        if (isReady) {
                            dispatch({ type: "Start" });
                        } else {
                            throw new Error("Data grid (Export): can't start without handler.");
                        }
                    },
                    abort: () => {
                        dispatch({ type: "Abort" });
                    }
                };

                return dataExportStream;
            },
            [_onOverwrite]: (): void => {
                isOverwrittenByOtherDatagrid = true;
            }
        };

        const existingAPI = window[DATAGRID_DATA_EXPORT][props.name];

        if (existingAPI) {
            existingAPI[_onOverwrite]();
        }

        window[DATAGRID_DATA_EXPORT][props.name] = exporter;
        window.DATAGRID_DATA_EXPORT = DATAGRID_DATA_EXPORT;

        return () => {
            dataExporterCleanup?.();
            if (isOverwrittenByOtherDatagrid === false) {
                delete window[DATAGRID_DATA_EXPORT][props.name];
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const actions = useMemo(() => ({ abort: () => dispatch({ type: "Abort" }) }), [dispatch]);
    return [result, actions];
};

function useExportMachine({
    columns,
    items = [],
    offset,
    limit = DEFAULT_LIMIT,
    hasMoreItems,
    updateDataSource
}: UseExportAPIProps): [UseExportAPIReturn, Dispatch<Action>] {
    const [state, dispatch] = useReducer(exportStateReducer, initState());
    const [exportFlow, flowCleanup] = useMemo(createExportFlow, []);

    // Keep params in sync with data source.
    useEffect(
        () =>
            dispatch({
                type: "DataSourceUpdate",
                payload: { items, offset, limit, hasMoreItems }
            }),
        [items, offset, limit, hasMoreItems]
    );

    useEffect(() => {
        dispatch({
            type: "ColumnsUpdate",
            payload: { columns }
        });
    }, [columns]);

    // Run export flow on every state change
    useEffect(() => {
        exportFlow(state, dispatch, updateDataSource);
        // Disable eslint rule to react only on state changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state]);

    // Disable eslint rule as flowCleanup is stable function.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => flowCleanup, []);

    return [
        {
            currentLimit: state.currentLimit,
            exporting: state.exporting,
            items: state.exporting ? state.snapshot.items : items ?? [],
            processedRows: state.processedRows
        },
        dispatch
    ];
}

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
                value = "n/a (custom content)";
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
    callback: null;
    columns: null;
    exporting: false;
    phase: "awaitingCallback";
    processedRows: number;
    snapshot: null;
}

interface ReadyState extends BaseState {
    callback: CallbackFunction;
    columns: ColumnsType[];
    exporting: false;
    phase: "readyToStart";
    processedRows: number;
    snapshot: DataSourceStateSnapshot;
}

interface WorkingState extends BaseState {
    callback: CallbackFunction;
    columns: ColumnsType[];
    exporting: true;
    phase: "resetOffset" | "exportColumns" | "awaitingData" | "exportData" | "finished" | "aborting" | "finally";
    processedRows: number;
    snapshot: DataSourceStateSnapshot;
}

type State = WorkingState | ReadyState | InitState;

type DataSourceUpdate = {
    type: "DataSourceUpdate";
    payload: { offset: number; items: ObjectItem[]; hasMoreItems: boolean; limit: number };
};

type Action =
    | DataSourceUpdate
    | {
          type: "Setup";
          payload: { callback: CallbackFunction; columns: ColumnsType[]; limit: number };
      }
    | {
          type: "ColumnsUpdate";
          payload: { columns: ColumnsType[] };
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

function stateAndPayloadEqual(state: State, { payload }: DataSourceUpdate): boolean {
    if (
        state.currentLimit === payload.limit &&
        state.currentOffset === payload.offset &&
        state.hasMoreItems === state.hasMoreItems &&
        state.currentItems.length === payload.items.length
    ) {
        const itemsEqual = state.currentItems.every((a, index) => {
            const b = payload.items[index];
            return a.id === b.id;
        });

        return itemsEqual;
    }

    return false;
}

function exportStateReducer(state: State, action: Action): State {
    if (action.type === "Reset") {
        return initState();
    }

    if (action.type === "DataSourceUpdate") {
        if (state.phase === "awaitingCallback" && stateAndPayloadEqual(state, action)) {
            return state;
        }

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

        if (next.exporting && currentPhase === "finally") {
            return {
                ...initState(),
                currentLimit: action.payload.limit,
                currentItems: action.payload.items,
                currentOffset: action.payload.offset
            };
        }

        return next;
    }

    if (action.type === "ColumnsUpdate") {
        if (state.phase === "readyToStart" || state.phase === "exportColumns") {
            return {
                ...state,
                columns: action.payload.columns
            };
        }
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
                phase: "awaitingData",
                processedRows: state.processedRows + state.currentLimit
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
        return { ...state, phase: "finally", processedRows: 0 };
    }

    return state;
}

type ExportFlowFn = (state: State, dispatch: Dispatch<Action>, updateFn: UpdateDataSourceFn) => Promise<void>;
type ExportFlowCleanup = () => void;

function createExportFlow(): [ExportFlowFn, ExportFlowCleanup] {
    let controller: FlowController | null = null;

    const getController = (): FlowController => {
        if (controller === null) {
            controller = new FlowController();
        }
        return controller;
    };

    const resetController = (): void => {
        controller = new FlowController();
    };

    const cleanup = (): void => {
        getController().abort("unmount");
    };

    const exportFlow: ExportFlowFn = async (state, dispatch, updateDataSource) => {
        const controller = getController();

        if (state.exporting === false) {
            return;
        }

        if (state.phase === "resetOffset") {
            controller.exec(() => updateDataSource({ offset: 0, limit: state.currentLimit, reload: true }));
            return;
        }

        if (state.phase === "exportColumns") {
            const { columns, callback } = state;
            await controller.exec(() => callback(exportColumns(columns)));
            controller.exec(() => dispatch({ type: "ColumnsExported" }));
            return;
        }

        if (state.phase === "exportData") {
            const { currentItems, callback, columns } = state;
            if (currentItems.length > 0) {
                await controller.exec(() => callback(exportData(currentItems, columns)));
                controller.exec(() => dispatch({ type: "PageExported" }));
            }
            return;
        }

        if (state.phase === "awaitingData") {
            const { currentOffset, currentLimit, hasMoreItems } = state;
            if (hasMoreItems) {
                controller.exec(() => updateDataSource({ offset: currentOffset + currentLimit }));
            } else {
                controller.exec(() => dispatch({ type: "Finish" }));
            }
            return;
        }

        if (state.phase === "aborting") {
            const { callback } = state;
            controller.exec(() => callback({ type: "aborted" }));
            controller.exec(() => dispatch({ type: "ExportEnd" }));
            controller.abort("abortAction");
            return;
        }

        if (state.phase === "finished") {
            const { callback } = state;
            controller.exec(() => callback({ type: "end" }));
            controller.exec(() => dispatch({ type: "ExportEnd" }));
            return;
        }

        if (state.phase === "finally") {
            const { snapshot } = state;
            if (controller.isAborted === false || controller.abortReason === "abortAction") {
                updateDataSource({
                    offset: snapshot.offset,
                    limit: snapshot.limit
                });
            }
            resetController();
        }
    };

    return [exportFlow, cleanup];
}

type AbortReason = "abortAction" | "unmount";

class FlowController {
    private aborted = false;
    private reason: AbortReason | null = null;

    async exec(cb: () => Promise<void> | void): Promise<void> {
        if (this.isAborted) {
            return;
        }
        await cb();
    }

    abort(reason: AbortReason): void {
        this.aborted = true;
        this.reason = reason;
    }

    get isAborted(): boolean {
        return this.aborted;
    }

    get abortReason(): AbortReason | null {
        return this.reason;
    }
}
