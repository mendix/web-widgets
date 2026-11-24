import { FilterData } from "@mendix/filter-commons/typings/settings";
import { ColumnId, SortDirection } from "./GridColumn";

export interface ColumnPersonalizationSettings {
    columnId: ColumnId;
    size: number | undefined;
    hidden: boolean;
    orderWeight: number;
    sortDir: SortDirection | undefined;
    sortWeight: number | undefined;
}

export type ColumnFilterSettings = Array<[key: ColumnId, data: FilterData]>;
