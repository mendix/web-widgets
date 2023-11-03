import { FilterFunction as ConditionValue } from "@mendix/widget-plugin-filtering";
import { useReducer } from "react";

type State = {
    filtered: boolean;
    filters: Array<ConditionValue | undefined>;
};

function initState(columns: number): State {
    return {
        filtered: false,
        filters: Array.from({ length: columns })
    };
}

function reducer(state: State, action: SetFilterAction): State {
    if (action.type === "SetFilter") {
        const nextFilters = [...state.filters];

        nextFilters[action.payload.columnNumber] = action.payload.value;

        return {
            filtered: true,
            filters: nextFilters
        };
    }

    return state;
}

export { ConditionValue };

export type SetFilterAction = {
    type: "SetFilter";
    payload: { columnNumber: number; value: ConditionValue };
};

export function useColumnFilters(columns: number): [State, React.Dispatch<SetFilterAction>] {
    return useReducer(reducer, columns, initState);
}
