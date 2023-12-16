import { ColumnSettings } from "./ColumnSettings";
import { ColumnId } from "./GridColumn";
import { SortRule } from "./GridModel";

export interface GridSettings {
    columns: ColumnSettings[];
    name: string;
    order: ColumnId[];
    schemaVersion: number;
    settingsHash: string;
    sort: SortRule[];
}
