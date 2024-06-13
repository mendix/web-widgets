import { initState } from "./constants";
import { Action, DataSourceUpdate, State } from "./types";

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

export function exportStateReducer(state: State, action: Action): State {
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
        if (
            state.phase === "readyToStart" ||
            state.phase === "exportColumns" ||
            state.phase === "exportData" ||
            state.phase === "awaitingCallback"
        ) {
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
            columns: state.columns || action.payload.columns,
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
