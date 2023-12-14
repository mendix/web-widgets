import { ColumnSettings } from "./ColumnSettings";
import { ColumnId } from "./GridColumn";
import { SortRule } from "./GridState";

export interface GridSettings {
    schemaVersion: number;
    settingsHash: string;
    columns: ColumnSettings[];
    sort: SortRule[];
    order: ColumnId[];
    /** reserved */
    gridWideFilters: unknown;
}
