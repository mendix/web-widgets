import { useMemo, useEffect, useReducer } from "react";
import { GridColumn } from "../typings/GridColumn";

type ColumnsHidden = number[];
type ColumnsOrder = number[];

export type ColumnsState = {
    columnsAvailable: GridColumn[];
    columnsHidden: ColumnsHidden;
    columnsOrder: ColumnsOrder;
    columns: GridColumn[];
    columnsVisible: GridColumn[];
    visibleLength: number;
};

type OrderUpdate = React.SetStateAction<ColumnsOrder>;

type HiddenUpdate = React.SetStateAction<ColumnsHidden>;

type ColumnsUpdate = React.SetStateAction<GridColumn[]>;

export type DispatchOrderUpdate = React.Dispatch<OrderUpdate>;

export type DispatchHiddenUpdate = React.Dispatch<HiddenUpdate>;

export type DispatchColumnsUpdate = React.Dispatch<ColumnsUpdate>;

type ColumnsStateFunctions = {
    setOrder: DispatchOrderUpdate;
    setHidden: DispatchHiddenUpdate;
    setColumns: DispatchColumnsUpdate;
};

const defaultState: ColumnsState = Object.freeze({
    columnsAvailable: [],
    columns: [],
    columnsHidden: [],
    columnsOrder: [],
    columnsVisible: [],
    visibleLength: 0
});

export function useColumnsState(columns: GridColumn[]): [ColumnsState, ColumnsStateFunctions] {
    const [state, dispatch] = useReducer(columnsStateReducer, defaultState, () => initColumnsState(columns));

    const memoizedColumnsStateFunctions = useMemo<ColumnsStateFunctions>(() => {
        return {
            setOrder: order => dispatch({ type: "SetOrder", payload: { order } }),
            setHidden: hidden => dispatch({ type: "SetHidden", payload: { hidden } }),
            setColumns: columns => dispatch({ type: "SetColumns", payload: { columns } })
        };
    }, [dispatch]);

    useEffect(() => dispatch({ type: "SetColumns", payload: { columns } }), [columns]);

    return [state, memoizedColumnsStateFunctions];
}

type Action =
    | { type: "SetOrder"; payload: { order: OrderUpdate } }
    | { type: "SetHidden"; payload: { hidden: HiddenUpdate } }
    | { type: "SetColumns"; payload: { columns: ColumnsUpdate } };

function columnsStateReducer(state: ColumnsState, action: Action): ColumnsState {
    switch (action.type) {
        case "SetOrder": {
            return reduceOnPropChange(state, "columnsOrder", action.payload.order, newState => {
                assertOrderMatchColumns(newState);
                return computeVisible(newState);
            });
        }
        case "SetHidden": {
            return reduceOnPropChange(state, "columnsHidden", action.payload.hidden, computeVisible);
        }
        case "SetColumns": {
            return reduceOnPropChange(state, "columns", action.payload.columns, draftState =>
                computeVisible({
                    ...draftState,
                    columnsAvailable: draftState.columns.filter(column => column.visible)
                })
            );
        }
        default:
            throw new Error("Columns state reducer: unknown action type");
    }
}

function reduceOnPropChange<
    S extends ColumnsState,
    P extends keyof S,
    A extends React.SetStateAction<S[P]>,
    R extends (state: S, prevProp: S[P], nextProp: S[P]) => S
>(state: S, prop: P, action: A, reduce?: R): S {
    const [prev, next] = getPropUpdate(state, prop, action);

    if (Object.is(prev, next)) {
        return state;
    }

    const newState = { ...state, [prop]: next };

    if (typeof reduce === "function") {
        return reduce(newState, prev, next);
    }

    return newState;
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

function computeVisible<S extends ColumnsState>(draftState: S): S {
    const columnsVisible = draftState.columnsOrder.flatMap(columnNumber => {
        const column = draftState.columns[columnNumber];
        return draftState.columnsHidden.includes(columnNumber) || !column.visible ? [] : [column];
    });

    return {
        ...draftState,
        columnsVisible,
        visibleLength: columnsVisible.length
    };
}

function assertOrderMatchColumns({ columns, columnsOrder }: ColumnsState): void {
    const arr1 = columns.map(c => c.columnNumber);
    const arr2 = [...columnsOrder].sort((a, b) => a - b);

    if (arr1.length === arr2.length && arr2.every((n, index) => n === arr1[index])) {
        return;
    }

    throw new Error("Invalid columns state: invalid columns order");
}

export function initColumnsState(columns: GridColumn[]): ColumnsState {
    return computeVisible({
        columns,
        columnsAvailable: columns.filter(column => column.visible),
        columnsOrder: columns.map(col => col.columnNumber),
        columnsHidden: columns.flatMap(column => (column.initiallyHidden ? [column.columnNumber] : [])),
        columnsVisible: [],
        visibleLength: 0
    });
}
