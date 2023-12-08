import { ListValue } from "mendix";
import { FilterCondition } from "mendix/filters";
import { GridState } from "../../typings/GridState";
import { SortRule } from "../../typings/GridSettings";
import { ColumnId, GridColumn, SortInstruction } from "../../typings/GridColumn";
import { Column } from "../../helpers/Column";

export function getSortInstructions({ sort, columns }: GridState): SortInstruction[] {
    return sort.flatMap(([id, dir]) => {
        const column = columns.find(c => c.columnId === id);
        const inst = column?.sortInstruction(dir);
        return inst ? [inst] : [];
    });
}

export function computeSort(sort: SortRule[], columnId: ColumnId): SortRule[] {
    const [[id, dir] = []] = sort;

    if (id === columnId) {
        return dir === "asc" ? [[columnId, "desc"]] : [];
    }

    return [[columnId, "asc"]];
}

export function computeNewState<S extends GridState>(draft: S): S {
    const available = sortByOrder(draft.columnsAvailable, draft.columnsOrder);
    const visible = available.filter(column => !draft.columnsHidden.has(column.columnId));
    return {
        ...draft,
        columnsVisible: visible,
        columnsAvailable: available
    };
}

function sortByOrder(columns: GridColumn[], order: ColumnId[]): GridColumn[] {
    const result = [...columns];
    const index = Object.fromEntries(order.map((id, index) => [id, index]));
    result.sort((a, b) => index[a.columnId] - index[b.columnId]);
    return result;
}

export function initGridState(columns: GridColumn[], initialFilter?: FilterCondition): GridState {
    return computeNewState({
        sort: [],
        columnsSize: {},
        columns,
        columnsAvailable: columns.filter(column => column.visible),
        columnsOrder: columns.map(col => col.columnId),
        columnsHidden: new Set(columns.flatMap(column => (column.initiallyHidden ? [column.columnId] : []))),
        columnsVisible: [],
        initialFilter
    });
}

export function initFromDataSource(ds: ListValue, columns: Column[]): GridState {
    const initState = initGridState(columns, ds.filter);
    initState.sort = ds.sortOrder.flatMap(([attrId, dir]) => {
        const columnId = columns.find(col => col.attrId === attrId)?.columnId;
        return columnId ? [[columnId, dir]] : [];
    });

    return initState;
}

export function reduceOnPropChange<
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

export function getPropUpdate<S, P extends keyof S, A extends React.SetStateAction<S[P]>>(
    state: S,
    prop: P,
    action: A
): [S[P], S[P]] {
    const prev = state[prop];
    const next = typeof action === "function" ? action(prev) : action;

    return [prev, next];
}
