/* eslint-disable no-bitwise */
import { ColumnId, GridColumn } from "../../typings/GridColumn";
import { ListValue } from "mendix";
import { GridSettings } from "../../typings/GridSettings";
import { Column } from "../../helpers/Column";
import * as Grid from "../../typings/GridModel";

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

export function getHash(columns: GridColumn[], gridName: string): string {
    const data = JSON.stringify({
        name: gridName,
        columns: columns.map(col => ({
            columnId: col.columnId,
            canSort: col.canSort,
            canHide: col.canHide,
            canResize: col.canResize,
            canDrag: col.canDrag
        }))
    });
    return hash(data).toString();
}

export function sortByOrder<T extends GridColumn>(columns: T[], order: ColumnId[]): T[] {
    const result = [...columns];
    const index = Object.fromEntries(order.map((id, index) => [id, index]));
    result.sort((a, b) => index[a.columnId] - index[b.columnId]);
    return result;
}

export function sortToInst(sort: Grid.SortOrder, columns: Column[]): Grid.SortInstruction[] {
    return sort.flatMap<Grid.SortInstruction>(([id, dir]) => {
        const { attrId } = columns.find(c => c.columnId === id) ?? {};
        return attrId ? [[attrId, dir]] : [];
    });
}

export function instToSort(inst: Grid.SortInstruction[], columns: Column[]): Grid.SortOrder {
    return inst.flatMap<Grid.SortRule>(([attrId, dir]) => {
        const columnId = columns.find(col => col.attrId === attrId)?.columnId;
        return columnId ? [[columnId, dir]] : [];
    });
}

export function paramsFromSettings(settings: GridSettings, ds: ListValue): Grid.InitParams {
    return {
        sortOrder: settings.sortOrder,
        columnOrder: settings.columnOrder,
        hidden: new Set(settings.columns.flatMap(col => (col.hidden ? [col.columnId] : []))),
        size: Object.fromEntries(settings.columns.map(col => [col.columnId, col.size])),
        filter: ds.filter
    };
}

export function paramsFromColumns(columns: Column[], ds: ListValue): Grid.InitParams {
    return {
        sortOrder: instToSort(ds.sortOrder, columns),
        size: {},
        hidden: new Set(columns.flatMap(column => (column.initiallyHidden ? [column.columnId] : []))),
        columnOrder: columns.map(col => col.columnId),
        filter: ds.filter
    };
}

export function stateToSettings(params: Grid.StorableState): GridSettings {
    return {
        schemaVersion: 1,
        settingsHash: params.settingsHash,
        name: params.name,
        sortOrder: params.sortOrder,
        columnOrder: params.columnOrder,
        columns: params.columns.map(({ columnId }) => ({
            columnId,
            hidden: params.hidden.has(columnId),
            size: params.size[columnId],
            filterSettings: undefined
        }))
    };
}
