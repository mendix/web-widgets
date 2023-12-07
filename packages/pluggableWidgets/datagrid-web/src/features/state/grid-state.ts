import { useReducer, useMemo } from "react";
import { ColumnId, GridColumn } from "../../typings/GridColumn";
import { SortRule } from "../../typings/GridSettings";
import { ColumnsById, GridState } from "../../typings/GridState";

type OrderUpdate = React.SetStateAction<ColumnId[]>;

type HiddenUpdate = React.SetStateAction<ColumnId[]>;

type SizeUpdate = [ColumnId, number];

type Action =
    | { type: "SetOrder"; payload: { order: OrderUpdate } }
    | { type: "SetHidden"; payload: { hidden: HiddenUpdate } }
    | { type: "ColumnsUpdate"; payload: { columns: GridColumn[] } }
    | { type: "SortUpdate"; payload: { columnId: ColumnId } }
    | { type: "SizeUpdate"; payload: SizeUpdate };

function reducer(state: GridState, action: Action): GridState {
    switch (action.type) {
        case "SetOrder": {
            return reduceOnPropChange(state, "columnsOrder", action.payload.order, computeVisible);
        }

        case "SetHidden": {
            return reduceOnPropChange(state, "columnsHidden", action.payload.hidden, computeVisible);
        }

        case "ColumnsUpdate": {
            return reduceOnPropChange(state, "columns", columnMap(action.payload.columns), draftState =>
                computeVisible({
                    ...draftState,
                    columnsAvailable: action.payload.columns.filter(column => column.visible)
                })
            );
        }

        case "SizeUpdate": {
            const [id, width] = action.payload;
            return {
                ...state,
                columnsSize: {
                    ...state.columnsSize,
                    [id]: width
                }
            };
        }

        case "SortUpdate": {
            return {
                ...state,
                sort: computeSort(state.sort, action.payload.columnId)
            };
        }

        default:
            throw new Error("Grid state reducer: unknown action type");
    }
}

function computeSort(sort: SortRule[], columnId: ColumnId): SortRule[] {
    const [[id, dir] = []] = sort;

    if (id === columnId) {
        return dir === "asc" ? [[columnId, "desc"]] : [];
    }

    return [[columnId, "asc"]];
}

function columnMap(columns: GridColumn[]): ColumnsById {
    return Object.fromEntries(columns.map(column => [column.columnId, column]));
}

function computeVisible<S extends GridState>(draftState: S): S {
    const columnsVisible = draftState.columnsOrder.flatMap(columnId => {
        const column = draftState.columns[columnId];
        return draftState.columnsHidden.includes(columnId) || !column.visible ? [] : [column];
    });

    return {
        ...draftState,
        columnsVisible,
        visibleLength: columnsVisible.length
    };
}

export function initGridState(columns: GridColumn[]): GridState {
    return computeVisible({
        sort: [],
        columnsSize: {},
        columns: columnMap(columns),
        columnsAvailable: columns.filter(column => column.visible),
        columnsOrder: columns.map(col => col.columnId),
        columnsHidden: columns.flatMap(column => (column.initiallyHidden ? [column.columnId] : [])),
        columnsVisible: []
    });
}

function reduceOnPropChange<
    S extends GridState,
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

type UpdateFunctions = {
    setOrder: React.Dispatch<OrderUpdate>;
    setHidden: React.Dispatch<HiddenUpdate>;
    setColumns: React.Dispatch<GridColumn[]>;
    setSort: React.Dispatch<ColumnId>;
    setSize: React.Dispatch<SizeUpdate>;
};

export function useGridState(initState: GridState): [GridState, UpdateFunctions] {
    const [state, dispatch] = useReducer(reducer, initState);

    const memoizedUpdateFunctions = useMemo<UpdateFunctions>(() => {
        return {
            setOrder: order => dispatch({ type: "SetOrder", payload: { order } }),
            setHidden: hidden => dispatch({ type: "SetHidden", payload: { hidden } }),
            setColumns: columns => dispatch({ type: "ColumnsUpdate", payload: { columns } }),
            setSort: columnId => dispatch({ type: "SortUpdate", payload: { columnId } }),
            setSize: size => dispatch({ type: "SizeUpdate", payload: size })
        };
    }, [dispatch]);

    return [state, memoizedUpdateFunctions];
}
