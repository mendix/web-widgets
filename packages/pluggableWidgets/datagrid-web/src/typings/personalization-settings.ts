import { ColumnId } from "./GridColumn";
import { SortDirection, SortRule } from "./sorting";

export interface ColumnPersonalizationSettings {
    columnId: ColumnId;
    size: number | undefined;
    hidden: boolean;
    orderWeight: number;
    sortDir: SortDirection | undefined;
    sortWeight: number | undefined;
}

interface ColumnPersonalizationStorageSettings {
    columnId: ColumnId;
    size: number | undefined;
    hidden: boolean;
}

export type FilterData<T = string | Date | number | null | Big> =
    | [string, T | undefined, T | undefined]
    | string[]
    | null;

export type FiltersSettingsMap<T> = Map<T, FilterData>;

type ColumnFilterSettings = { [key: ColumnId]: FilterData };

export interface GridPersonalizationStorageSettings {
    name: string;
    schemaVersion: number;
    settingsHash: string;
    columns: ColumnPersonalizationStorageSettings[];
    columnFilters: ColumnFilterSettings;
    columnOrder: ColumnId[];
    sortOrder: SortRule[];
}
