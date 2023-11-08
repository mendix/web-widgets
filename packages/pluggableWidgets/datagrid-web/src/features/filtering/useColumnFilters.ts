import { FilterState } from "@mendix/widget-plugin-filtering";
import { FilterCondition } from "mendix/filters";
import { useReducer, useMemo } from "react";
import { filterToCond } from "./utils";

type State = {
    filters: Array<FilterState | undefined>;
};

function initState(columns: number): State {
    return {
        filters: Array.from({ length: columns })
    };
}

function reducer(state: State, action: SetFilterAction): State {
    if (action.type === "SetFilter") {
        const nextFilters = [...state.filters];

        nextFilters[action.payload.columnNumber] = action.payload.value;

        return {
            filters: nextFilters
        };
    }

    return state;
}

export type SetFilterAction = {
    type: "SetFilter";
    payload: { columnNumber: number; value: FilterState };
};

export function useColumnFilters(columns: number): [FilterCondition[], React.Dispatch<SetFilterAction>] {
    const [state, dispatch] = useReducer(reducer, columns, initState);
    const conditions = useMemo(() => state.filters.flatMap(filterToCond), [state]);
    return [conditions, dispatch];
}
