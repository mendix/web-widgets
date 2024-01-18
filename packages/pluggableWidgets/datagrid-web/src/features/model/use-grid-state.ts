import { useMemo, useEffect, useReducer } from "react";
import { useWatchValues } from "@mendix/widget-plugin-hooks/useWatchValues";
import { ColumnId } from "../../typings/GridColumn";
import * as Grid from "../../typings/GridModel";
import { sortByOrder } from "./utils";

type NamedAction<Name, Fn> = Fn extends (arg: infer Payload) => void
    ? {
          type: Name;
          payload: Payload;
      }
    : never;

type Action =
    | {
          [Name in keyof Grid.Actions]: NamedAction<Name, Grid.Actions[Name]>;
      }[keyof Grid.Actions]
    | {
          type: "setColumns";
          payload: Grid.Columns;
      };

type InitArg = {
    params: Grid.InitParams;
    columns: Grid.Columns;
};

export type StateChangeFx = (prev: Grid.State, next: Grid.State) => void;

export function useGridState(
    initParams: Grid.InitParams,
    columns: Grid.Columns,
    onStateChange: StateChangeFx
): [Grid.State, Grid.Actions] {
    const [state, dispatch] = useReducer(gridStateReducer, { params: initParams, columns }, initGridState);

    const memoizedGridActions = useMemo<Grid.Actions>(() => {
        return {
            resize: payload => dispatch({ type: "resize", payload }),
            setFilter: payload => dispatch({ type: "setFilter", payload }),
            sortBy: payload => dispatch({ type: "sortBy", payload }),
            swap: payload => dispatch({ type: "swap", payload }),
            toggleHidden: payload => dispatch({ type: "toggleHidden", payload })
        };
    }, [dispatch]);

    useEffect(() => dispatch({ type: "setColumns", payload: columns }), [columns]);
    useWatchValues(([prevState], [newState]) => onStateChange(prevState, newState), [state]);

    return [state, memoizedGridActions];
}

function gridStateReducer(state: Grid.State, action: Action): Grid.State {
    switch (action.type) {
        case "resize": {
            return {
                ...state,
                size: reduceSize(state.size, action.payload)
            };
        }
        case "setFilter": {
            if (state.filter === action.payload) {
                return state;
            }
            return { ...state, filter: action.payload };
        }
        case "setColumns": {
            return state.allColumns === action.payload ? state : reduceColumns(state, action.payload);
        }
        case "sortBy": {
            return {
                ...state,
                sortOrder: reduceSortSingle(state.sortOrder, action.payload)
            };
        }
        case "swap": {
            const newOrder = reduceOrder(state.columnOrder, action.payload);
            const newAvailable = computeAvailable(state.allColumns, newOrder);
            return {
                ...state,
                columnOrder: newOrder,
                availableColumns: newAvailable,
                visibleColumns: computeVisible(newAvailable, state.hidden)
            };
        }
        case "toggleHidden": {
            const newHidden = computeHidden(
                state.availableColumns,
                state.hidden,
                reduceHidden(state.hidden, action.payload)
            );
            if (state.hidden === newHidden) {
                return state;
            }
            return {
                ...state,
                hidden: newHidden,
                sortOrder: reduceSortRemove(state.sortOrder, action.payload),
                visibleColumns: computeVisible(state.availableColumns, newHidden)
            };
        }
    }
}

function computeAvailable(allColumns: Grid.Columns, order: Grid.ColumnOrder): Grid.Columns {
    return sortByOrder(allColumns, order).filter(c => c.visible);
}

function computeHidden(available: Grid.Columns, currentHidden: Grid.Hidden, newHidden: Grid.Hidden): Grid.Hidden {
    // If at least one is visible
    if (available.some(c => !newHidden.has(c.columnId))) {
        return newHidden;
    }

    return currentHidden;
}

function computeVisible(available: Grid.Columns, hidden: Grid.Hidden): Grid.Columns {
    return available.filter(c => !hidden.has(c.columnId));
}

function reduceColumns(state: Grid.State, newColumns: Grid.Columns): Grid.State {
    const newAvailable = computeAvailable(newColumns, state.columnOrder);
    let hidden = state.hidden;
    let newVisible = computeVisible(newAvailable, hidden);
    if (newVisible.length === 0) {
        hidden = new Set<ColumnId>();
        newVisible = computeVisible(newAvailable, hidden);
    }
    return {
        ...state,
        allColumns: newColumns,
        availableColumns: newAvailable,
        visibleColumns: newVisible,
        hidden
    };
}

function reduceOrder(prev: Grid.ColumnOrder, [a, b]: [a: ColumnId, b: ColumnId]): Grid.ColumnOrder {
    const indexA = prev.indexOf(a);
    const indexB = prev.indexOf(b);

    if (indexA === -1 || indexB === -1) {
        console.warn("Unable to find column in the current order array.");
        return prev;
    }

    if (indexA !== indexB) {
        const nextOrder = [...prev];
        nextOrder[indexA] = b;
        nextOrder[indexB] = a;
        return nextOrder;
    }

    return prev;
}

function reduceSize(prev: Grid.ColumnWidthConfig, [id, size]: [id: ColumnId, size: number]): Grid.ColumnWidthConfig {
    return {
        ...prev,
        [id]: size
    };
}

function reduceSortSingle(sort: Grid.SortOrder, columnId: ColumnId): Grid.SortOrder {
    const [[id, dir] = []] = sort;
    if (id === columnId) {
        return dir === "asc" ? [[columnId, "desc"]] : [];
    }
    return [[columnId, "asc"]];
}

function reduceSortRemove(sort: Grid.SortOrder, columnId: ColumnId): Grid.SortOrder {
    return sort.flatMap(rule => (rule[0] === columnId ? [] : [rule]));
}

function reduceHidden(prev: Grid.Hidden, id: ColumnId): Grid.Hidden {
    const next = new Set(prev);

    if (next.delete(id) === false) {
        next.add(id);
    }

    return next;
}

export function initGridState({ params, columns }: InitArg): Grid.State {
    const availableColumns = computeAvailable(columns, params.columnOrder);
    const visibleColumns = computeVisible(availableColumns, params.hidden);
    return {
        allColumns: columns,
        availableColumns,
        columnOrder: params.columnOrder,
        filter: params.filter,
        hidden: params.hidden,
        size: params.size,
        sortOrder: params.sortOrder,
        visibleColumns
    };
}
