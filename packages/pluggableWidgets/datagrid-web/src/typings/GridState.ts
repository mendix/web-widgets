import { FilterCondition } from "mendix/filters";
import { ColumnId, GridColumn } from "./GridColumn";
import { SortRule } from "./GridSettings";

export interface ColumnWidthConfig {
    [columnId: ColumnId]: number | undefined;
}

export type GridState = {
    sort: SortRule[];
    columnsSize: ColumnWidthConfig;
    columnsAvailable: GridColumn[];
    columnsHidden: Set<ColumnId>;
    columnsOrder: ColumnId[];
    columns: GridColumn[];
    columnsVisible: GridColumn[];
    /** Datasource filter, should be used only to restore filters */
    readonly initialFilter: FilterCondition | undefined;
};
