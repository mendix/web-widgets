import { GridState } from "../../typings/GridState";
import { GridSettings } from "../../typings/GridSettings";
import { ColumnId } from "../../typings/GridColumn";

export const SCHEMA_VERSION = 1;

export function stateToSettings(state: GridState): GridSettings {
    return {
        schemaVersion: 1,
        columns: state.columns.map(({ columnId }) => ({
            columnId,
            hidden: state.columnsHidden.has(columnId),
            size: state.columnsSize[columnId],
            filterSettings: undefined
        })),
        sort: state.sort,
        order: state.columnsOrder,
        gridWideFilters: undefined,
        settingsHash: undefined
    };
}

export function writeSettings(state: GridState, settings: GridSettings): GridState {
    const [result, size] = isSubset(state.columnsOrder, settings.order);

    if (result === false) {
        return state;
    }

    if (Object.is(size, "<")) {
        settings = filter(settings, state.columnsOrder);
    }

    const next = { ...state };
    next.columnsHidden = new Set(settings.columns.flatMap(col => (col.hidden ? [col.columnId] : [])));
    next.columnsOrder = settings.order;
    next.columnsSize = Object.fromEntries(settings.columns.map(col => [col.columnId, col.size]));

    return next;
}

function filter(settings: GridSettings, range: ColumnId[]): GridSettings {
    const ids = new Set(range);
    const next = { ...settings };
    next.columns = next.columns.filter(col => ids.has(col.columnId));
    next.sort = next.sort.filter(([id]) => ids.has(id));
    next.order = next.order.filter(id => ids.has(id));

    return next;
}

function isSubset<T>(a: Iterable<T>, b: Iterable<T>): [boolean, "<" | ">" | "="] {
    const [setA, setB] = [new Set(a), new Set(b)];

    if (setA.size > setB.size) {
        return [false, ">"];
    }

    const theorem = setA.size < setB.size ? "<" : "=";

    for (const item of setA) {
        if (!setB.has(item)) {
            return [false, theorem];
        }
    }

    return [true, theorem];
}
