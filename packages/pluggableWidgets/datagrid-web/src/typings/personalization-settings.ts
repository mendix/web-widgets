import { ColumnId } from "./GridColumn";
import { SortDirection, SortRule } from "./sorting";

export interface ColumnPersonalizationSettings {
    columnId: ColumnId;
    size: number | undefined;
    hidden: boolean;
    orderWeight: number;
    sortDir: SortDirection | undefined;
    sortWeight: number | undefined;
    filterSettings: unknown;
}

interface ColumnPersonalizationStorageSettings {
    columnId: ColumnId;
    size: number | undefined;
    hidden: boolean;
    filterSettings: unknown;
}

export interface GridPersonalizationStorageSettings {
    name: string;
    schemaVersion: number;
    settingsHash: string;

    columns: ColumnPersonalizationStorageSettings[];
    columnOrder: ColumnId[];
    sortOrder: SortRule[];
}
