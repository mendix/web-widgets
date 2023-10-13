import { useMemo, useReducer } from "react";
import { sortColumns } from "../helpers/utils";
import { GridColumn } from "../typings/GridColumn";

type ColumnsHidden = number[];
type ColumnsOrder = number[];

export type ColumnsState = {
    columnsHidden: ColumnsHidden;
    columnsOrder: ColumnsOrder;
    columns: GridColumn[];
    columnsVisible: GridColumn[];
};

type OrderUpdate = React.SetStateAction<ColumnsOrder>;

type HiddenUpdate = React.SetStateAction<ColumnsHidden>;

export type DispatchOrderUpdate = React.Dispatch<OrderUpdate>;

export type DispatchHiddenUpdate = React.Dispatch<HiddenUpdate>;

type ColumnsStateFunctions = {
    setOrder: DispatchOrderUpdate;
    setHidden: DispatchHiddenUpdate;
};

type ColumnsStateInitializer = (columnsState: ColumnsState) => ColumnsState;

const defaultState: ColumnsState = Object.freeze({
    columns: [],
    columnsHidden: [],
    columnsOrder: [],
    columnsVisible: []
});

export function useColumnsState(initializer?: ColumnsStateInitializer): [ColumnsState, ColumnsStateFunctions] {
    const [state, dispatch] = useReducer(inspect, defaultState, state => {
        return initializer ? initializer(state) : state;
    });

    const memoizedColumnsStateFunctions = useMemo<ColumnsStateFunctions>(() => {
        return {
            setOrder: order => dispatch({ type: "SetOrder", payload: { order } }),
            setHidden: hidden => dispatch({ type: "SetHidden", payload: { hidden } })
        };
    }, [dispatch]);

    return [state, memoizedColumnsStateFunctions];
}

type Action =
    | { type: "SetOrder"; payload: { order: OrderUpdate } }
    | { type: "SetHidden"; payload: { hidden: HiddenUpdate } };

function inspect(s: ColumnsState, a: Action): ColumnsState {
    console.log("prev", s);
    const next = columnsStateReducer(s, a);
    console.log("next", next);
    return next;
}

function columnsStateReducer(state: ColumnsState, action: Action): ColumnsState {
    switch (action.type) {
        case "SetOrder": {
            const [prev, next] = getPropUpdate(state, "columnsOrder", action.payload.order);

            if (Object.is(prev, next)) {
                return state;
            }

            return computeNextState({ ...state, columnsOrder: next });
        }
        case "SetHidden": {
            const [prev, next] = getPropUpdate(state, "columnsHidden", action.payload.hidden);

            if (Object.is(prev, next)) {
                return state;
            }

            return computeNextState({ ...state, columnsHidden: next });
        }
        default:
            throw new Error("Columns state reducer: unknown action type");
    }
}

function getPropUpdate<S, P extends keyof S, A extends React.SetStateAction<S[P]>>(
    state: S,
    prop: P,
    action: A
): [S[P], S[P]] {
    const prev = state[prop];
    const next = typeof action === "function" ? action(prev) : action;

    return [prev, next];
}

function computeNextState(draftState: ColumnsState): ColumnsState {
    const visible = draftState.columns
        .filter(column => !draftState.columnsHidden.includes(column.columnNumber))
        .sort((a, b) => sortColumns(draftState.columnsOrder, a, b));

    // Re-compute order whenever order or hidden changes.
    const columnsOrder = visible.map(col => col.columnNumber);

    return {
        ...draftState,
        columnsOrder,
        columnsVisible: visible
    };
}

function initColumnsState(columns: GridColumn[]): ColumnsState {
    return computeNextState({
        columns,
        columnsOrder: columns.flatMap(column => (column.hidden ? [] : [column.columnNumber])),
        columnsHidden: columns.flatMap(column => (column.hidden ? [column.columnNumber] : [])),
        columnsVisible: []
    });
}

export function createInitializer(columns: GridColumn[]): ColumnsStateInitializer {
    return () => initColumnsState(columns);
}
