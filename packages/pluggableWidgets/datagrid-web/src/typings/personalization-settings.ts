import { FilterData } from "@mendix/widget-plugin-filtering/typings/settings";
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

export type ColumnFilterSettings = Array<[key: ColumnId, data: FilterData]>;

export type GroupFilterSettings = Array<[key: string, data: FilterData]>;

export interface GridPersonalizationStorageSettings {
    name: string;
    schemaVersion: 2;
    settingsHash: string;
    columns: ColumnPersonalizationStorageSettings[];
    groupFilters: GroupFilterSettings;
    columnFilters: ColumnFilterSettings;
    columnOrder: ColumnId[];
    sortOrder: SortRule[];
}
