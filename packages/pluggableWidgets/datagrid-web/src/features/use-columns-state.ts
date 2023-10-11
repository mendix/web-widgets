import { useEffect, useMemo, useReducer, useRef } from "react";

type ColumnsHidden = number[];
type ColumnsOrder = number[];

export type ColumnsState = {
    columnsHidden: ColumnsHidden;
    columnsOrder: ColumnsOrder;
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

function initColumnsState(): ColumnsState {
    return {
        columnsHidden: [],
        columnsOrder: []
    };
}

type Action =
    | { type: "SetOrder"; payload: { order: ColumnsOrder } }
    | { type: "SetHidden"; payload: { hidden: ColumnsHidden } };

function columnsStateReducer(state: ColumnsState, action: Action): ColumnsState {
    switch (action.type) {
        case "SetOrder":
            return {
                ...state,
                columnsOrder: action.payload.order
            };
        case "SetHidden":
            return {
                ...state,
                columnsHidden: action.payload.hidden
            };
        default:
            throw new Error("unknown action type");
    }
}
