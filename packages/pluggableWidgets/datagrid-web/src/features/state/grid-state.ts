import { useReducer, useMemo } from "react";
import { ColumnId, GridColumn } from "../../typings/GridColumn";
import { GridState } from "../../typings/GridState";
import { OrderUpdate, HiddenUpdate, SizeUpdate, UpdateFunctions } from "./base";
import { computeNewState, computeSort, reduceOnPropChange } from "./utils";

type Action =
    | { type: "SetOrder"; payload: { order: OrderUpdate } }
    | { type: "SetHidden"; payload: { hidden: HiddenUpdate } }
    | { type: "ColumnsUpdate"; payload: { columns: GridColumn[] } }
    | { type: "SortUpdate"; payload: { columnId: ColumnId } }
    | { type: "SizeUpdate"; payload: SizeUpdate };

function reducer(state: GridState, action: Action): GridState {
    switch (action.type) {
        case "SetOrder": {
            return reduceOnPropChange(state, "columnsOrder", action.payload.order, computeNewState);
        }

        case "SetHidden": {
            return reduceOnPropChange(state, "columnsHidden", action.payload.hidden, computeNewState);
        }

        case "ColumnsUpdate": {
            return reduceOnPropChange(state, "columns", action.payload.columns, draft =>
                computeNewState({
                    ...draft,
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
