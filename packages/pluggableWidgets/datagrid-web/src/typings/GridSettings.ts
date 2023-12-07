import { ColumnSettings } from "./ColumnSettings";
import { ColumnId } from "./GridColumn";

export type SortRule = [columnId: ColumnId, dir: "asc" | "desc"];

export interface GridSettings {
    schemaVersion: number;
    columns: ColumnSettings[];
    sort: SortRule[];
    order: ColumnId[];
    /** reserved */
    gridWideFilters: unknown;
    settingsHash: unknown;
}
