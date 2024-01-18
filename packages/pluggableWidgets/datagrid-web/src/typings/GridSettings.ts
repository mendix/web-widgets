import { ColumnSettings } from "./ColumnSettings";
import { ColumnId } from "./GridColumn";
import { SortRule } from "./GridModel";

export interface GridSettings {
    columns: ColumnSettings[];
    name: string;
    columnOrder: ColumnId[];
    schemaVersion: number;
    settingsHash: string;
    sortOrder: SortRule[];
}
