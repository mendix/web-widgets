import { useReducer, useMemo } from "react";
import { ColumnId, GridColumn } from "../../typings/GridColumn";
import { GridState } from "../../typings/GridState";
import { OrderUpdate, HiddenUpdate, SizeUpdate, UpdateFunctions } from "./base";

type Action =
    | { type: "SetOrder"; payload: { order: OrderUpdate } }
    | { type: "SetHidden"; payload: { hidden: HiddenUpdate } }
    | { type: "ColumnsUpdate"; payload: { columns: GridColumn[] } }
    | { type: "SortUpdate"; payload: { columnId: ColumnId } }
    | { type: "SizeUpdate"; payload: SizeUpdate };

function reducer(_state: GridState, _action: Action): GridState {
    return null as unknown as GridState;
}

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
