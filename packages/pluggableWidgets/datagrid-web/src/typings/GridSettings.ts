import { ColumnSettings } from "./ColumnSettings";
import { ColumnId } from "./GridColumn";

type SortRule = [columnId: ColumnId, dir: "asc" | "desc"];

export interface GridSettings {
    schemaVersion: number;
    columns: ColumnSettings[];
    sortOrder: SortRule[];
    hidden: ColumnId[];
    columnOrder: ColumnId[];
    /** reserved */
    gridWideFilters: unknown;
}
