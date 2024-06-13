import { useEffect, useMemo, useReducer, Dispatch } from "react";
import { DEFAULT_LIMIT, initState } from "../constants";
import { exportColumns } from "../export-columns";
import { exportData } from "../export-data";
import { exportStateReducer } from "../export-state-reducer";
import { Action, State, UpdateDataSourceFn } from "../types";
import { UseExportAPIProps, UseExportAPIReturn } from "./useDataExportApi";

export function useExportMachine({
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
                const result = exportData(currentItems, columns);
                if (result.status === "ready") {
                    await controller.exec(() => callback(result.message));
                    controller.exec(() => dispatch({ type: "PageExported" }));
                }
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
