import { FilterData } from "@mendix/filter-commons/typings/settings";
import { ColumnFilterSettings } from "../columns/column-settings";
import { ColumnId, SortRule } from "../columns/GridColumn";

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
