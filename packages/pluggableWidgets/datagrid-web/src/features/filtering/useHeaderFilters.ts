import { useRef, useMemo, useCallback } from "react";
import { FilterCondition } from "mendix/filters";
import { DispatchFilterUpdate, useMultipleFiltering, FilterState } from "@mendix/widget-plugin-filtering";
import { filterToCond } from "./utils";

export function useHeaderFilters(): [FilterCondition[], DispatchFilterUpdate] {
    const state = useMultipleFiltering();
    const stateRef = useRef<typeof state>(state);
    const conditions = useMemo(() => {
        stateRef.current = state;
        return Object.values(state)
            .map(([filterState]) => filterState)
            .flatMap(filterToCond);
    }, [state]);

    const dispatch = useCallback((value: FilterState) => {
        if (!value.filterType) {
            return;
        }
        const [, setState] = stateRef.current[value.filterType];
        setState(value);
    }, []);

    return [conditions, dispatch];
}
