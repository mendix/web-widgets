import { FilterData } from "@mendix/filter-commons/typings/settings";
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

export type CustomFilterSettings = Array<[key: string, data: FilterData]>;

export type DynamicFilterSettings = Array<{ field: string; data: FilterData }>;

export interface GridPersonalizationStorageSettings {
    name: string;
    schemaVersion: 3;
    settingsHash: string;
    columns: ColumnPersonalizationStorageSettings[];
    customFilters: CustomFilterSettings;
    columnFilters: ColumnFilterSettings;
    /** Dynamic filtering mode only. Missing means an empty Filter Set. */
    dynamicFilters?: DynamicFilterSettings;
    columnOrder: ColumnId[];
    sortOrder: SortRule[];
}
