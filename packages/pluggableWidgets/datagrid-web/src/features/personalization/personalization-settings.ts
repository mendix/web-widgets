import { FilterData } from "@mendix/filter-commons/typings/settings";
import type { ColumnFilterSettings, ColumnId, SortRule } from "../columns/tokens";

interface ColumnPersonalizationStorageSettings {
    columnId: ColumnId;
    size: number | undefined;
    hidden: boolean;
}

export type CustomFilterSettings = Array<[key: string, data: FilterData]>;

export interface GridPersonalizationStorageSettings {
    name: string;
    schemaVersion: 3;
    settingsHash: string;
    columns: ColumnPersonalizationStorageSettings[];
    customFilters: CustomFilterSettings;
    columnFilters: ColumnFilterSettings;
    columnOrder: ColumnId[];
    sortOrder: SortRule[];
}
