import { ListValue } from "mendix";
import { GridState } from "../../typings/GridState";
import { GridSettings } from "../../typings/GridSettings";
import { ColumnId, GridColumn } from "../../typings/GridColumn";
import { hasViewState } from "./datasource";
import { computeNewState, getSortInstructions } from "./utils";
import { ComputedInitState } from "./base";
import { SettingsStorage } from "../storage/base";

export function stateToSettings(state: GridState): GridSettings {
    return {
        schemaVersion: 1,
        columns: state.columns.map(({ columnId }) => ({
            columnId,
            hidden: true,
            size: 1,
            filterSettings: undefined
        })),
        sort: state.sort,
        order: [],
        gridWideFilters: undefined,

        settingsHash: ""
    };
}

export function writeSettings(state: GridState, settings: GridSettings): GridState {
    return {
        ...state,
        sort: settings.sort,
        order: settings.order,
        hidden: new Set(settings.columns.flatMap(col => (col.hidden ? [col.columnId] : []))),
        size: Object.fromEntries(settings.columns.map(col => [col.columnId, col.size]))
    };
}

export function filter(settings: GridSettings, range: ColumnId[]): GridSettings {
    const ids = new Set(range);
    const next = { ...settings };
    next.columns = next.columns.filter(col => ids.has(col.columnId));
    next.sort = next.sort.filter(([id]) => ids.has(id));
    next.order = next.order.filter(id => ids.has(id));

    return next;
}

export function isSubset<T>(a: Iterable<T>, b: Iterable<T>): [boolean, "<" | ">" | "="] {
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

export function computeFromSettings(initState: GridState, settings: GridSettings, ds: ListValue): ComputedInitState {
    const draft = writeSettings(initState, settings);

    // skip initView if ds already has a view state
    if (hasViewState(ds)) {
        return [computeNewState(draft)];
    }

    initState = computeNewState(draft);
    return [initState, { sortOrder: getSortInstructions(initState) }];
}

export function restoreSettings(columns: GridColumn[], storage: SettingsStorage): GridSettings | undefined {
    const settings = storage.load();

    if (settings === undefined) {
        return;
    }

    const ids = columns.map(col => col.columnId);
    const [result, size] = isSubset(ids, settings.order);

    // Can't proceed with current settings, reset.
    if (result === false) {
        storage.reset();
        return;
    }

    // remove extra columns if number of columns is decreased
    return Object.is(size, "<") ? filter(settings, ids) : settings;
}
