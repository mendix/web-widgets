/* eslint-disable no-bitwise */
import { GridColumn } from "../typings/GridColumn";

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
