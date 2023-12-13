import { ColumnSettings } from "./ColumnSettings";
import { ColumnId } from "./GridColumn";
import { SortRule } from "./GridState";

export interface GridSettings {
    schemaVersion: number;
    columns: ColumnSettings[];
    sort: SortRule[];
    order: ColumnId[];
    /** reserved */
    gridWideFilters: unknown;
    settingsHash: unknown;
}
