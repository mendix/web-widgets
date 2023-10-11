import { useEffect, useMemo, useReducer, useRef } from "react";
import { sortColumns } from "src/helpers/utils";
import { GridColumn } from "src/typings/GridColumn";

type ColumnsHidden = number[];
type ColumnsOrder = number[];

export type ColumnsState = {
    columnsHidden: ColumnsHidden;
    columnsOrder: ColumnsOrder;
    columns: GridColumn[];
    columnsVisible: GridColumn[];
};

type ColumnsStateFunctions = {
    setOrder: React.Dispatch<React.SetStateAction<ColumnsOrder>>;
    setHidden: React.Dispatch<React.SetStateAction<ColumnsHidden>>;
};

type ColumnsStateInitializer = (columnsState: ColumnsState) => ColumnsState;

export function useColumnsState(initializer?: ColumnsStateInitializer): [ColumnsState, ColumnsStateFunctions] {
    const [state, dispatch] = useReducer(columnsStateReducer, initColumnsState(), state => {
        return initializer ? initializer(state) : state;
    });
    const stateRef = useRef(state);

    useEffect(() => {
        stateRef.current = state;
    });

    const memoizedColumnsStateFunctions = useMemo<ColumnsStateFunctions>(() => {
        return {
            setOrder: valueOrFunction => {
                if (typeof valueOrFunction === "function") {
                    const value = stateRef.current.columnsOrder;
                    const newValue = valueOrFunction(value);
                    if (value !== newValue) {
                        dispatch({ type: "SetOrder", payload: { order: newValue } });
                    }
                } else {
                    dispatch({ type: "SetOrder", payload: { order: valueOrFunction } });
                }
            },
            setHidden: valueOrFunction => {
                if (typeof valueOrFunction === "function") {
                    const value = stateRef.current.columnsHidden;
                    const newValue = valueOrFunction(value);
                    if (value !== newValue) {
                        dispatch({ type: "SetHidden", payload: { hidden: newValue } });
                    }
                } else {
                    dispatch({ type: "SetHidden", payload: { hidden: valueOrFunction } });
                }
            }
        };
    }, [dispatch]);
    return [state, memoizedColumnsStateFunctions];
}

export function updateColumnsVisible(state: ColumnsState): ColumnsState {
    return {
        ...state,
        columnsVisible: state.columns.filter(column => !state.columnsHidden.includes(column.columnNumber))
    };
}

function initColumnsState(): ColumnsState {
    return {
        columns: [],
        columnsHidden: [],
        columnsOrder: [],
        columnsVisible: []
    };
}

type Action =
    | { type: "SetOrder"; payload: { order: ColumnsOrder } }
    | { type: "SetHidden"; payload: { hidden: ColumnsHidden } };

function columnsStateReducer(state: ColumnsState, action: Action): ColumnsState {
    switch (action.type) {
        case "SetOrder":
            const { order } = action.payload;
            return {
                ...state,
                columnsOrder: order,
                columnsVisible: [...state.columnsVisible.sort((a, b) => sortColumns(order, a, b))]
            };
        case "SetHidden":
            const { hidden } = action.payload;
            const newState = {
                ...state,
                columnsHidden: hidden
            };
            return updateColumnsVisible(newState);

        default:
            throw new Error("unknown action type");
    }
}
