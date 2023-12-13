/* eslint-disable no-bitwise */
import { ColumnId, GridColumn, SortInstruction } from "../../typings/GridColumn";
import { ListValue } from "mendix";
import { GridSettings } from "../../typings/GridSettings";
import { InitParams } from "./base";
import { Column } from "../../helpers/Column";
import { GridState, SortOrder } from "../../typings/GridState";

/**
 * Generates 32 bit FNV-1a hash from the given string.
 * As explained here: http://isthe.com/chongo/tech/comp/fnv/
 *
 * @param s {string} String to generate hash from.
 * @param [h] {number} FNV-1a hash generation init value.
 * @returns {number} The result integer hash.
 */
function hash(s: string, h = 0x811c9dc5): number {
    const l = s.length;

    for (let i = 0; i < l; i++) {
        h ^= s.charCodeAt(i);
        h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    }

    return h >>> 0;
}

export function getHash(columns: GridColumn[]): string {
    const data = JSON.stringify(
        columns.map(col => ({
            columnId: col.columnId,
            canSort: col.canSort,
            canHide: col.canHide,
            canResize: col.canResize,
            canDrag: col.canDrag
        }))
    );
    return hash(data).toString();
}

export function sortByOrder<T extends GridColumn>(columns: T[], order: ColumnId[]): T[] {
    const result = [...columns];
    const index = Object.fromEntries(order.map((id, index) => [id, index]));
    result.sort((a, b) => index[a.columnId] - index[b.columnId]);
    return result;
}

export function sortToInst(sort: SortOrder, columns: Column[]): SortInstruction[] {
    return sort.flatMap(([id, dir]) => {
        const column = columns.find(c => c.columnId === id);
        const inst = column?.sortInstruction(dir);
        return inst ? [inst] : [];
    });
}

export function instToSort(inst: SortInstruction[], columns: Column[]): SortOrder {
    return inst.flatMap(([attrId, dir]) => {
        const columnId = columns.find(col => col.attrId === attrId)?.columnId;
        return columnId ? [[columnId, dir]] : [];
    });
}

export function paramsFromSettings(settings: GridSettings, ds: ListValue): InitParams {
    return {
        sort: settings.sort,
        order: settings.order,
        hidden: new Set(settings.columns.flatMap(col => (col.hidden ? [col.columnId] : []))),
        size: Object.fromEntries(settings.columns.map(col => [col.columnId, col.size])),
        filter: ds.filter
    };
}

export function paramsFromColumns(columns: Column[], ds: ListValue): InitParams {
    return {
        sort: instToSort(ds.sortOrder, columns),
        size: {},
        hidden: new Set(columns.flatMap(column => (column.initiallyHidden ? [column.columnId] : []))),
        order: columns.map(col => col.columnId),
        filter: ds.filter
    };
}

export function stateToSettings(state: GridState): GridSettings {
    return {
        schemaVersion: 1,
        columns: state.columns.map(({ columnId }) => ({
            columnId,
            hidden: state.hidden.has(columnId),
            size: state.size[columnId],
            filterSettings: undefined
        })),
        sort: state.sort,
        order: state.order,
        gridWideFilters: undefined,
        settingsHash: undefined
    };
}
