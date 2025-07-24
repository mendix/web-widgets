import { fnv1aHash } from "@mendix/widget-plugin-grid/utils/fnv-1a-hash";
import { GridColumn } from "../typings/GridColumn";

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
    return fnv1aHash(data).toString();
}
