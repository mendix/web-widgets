import { FilterCondition } from "mendix/filters";
import { ColumnId, GridColumn } from "./GridColumn";

export interface ColumnWidthConfig {
    [columnId: ColumnId]: number | undefined;
}

export type SortRule = [columnId: ColumnId, dir: "asc" | "desc"];

export type Columns = GridColumn[];

export type Filter = FilterCondition | undefined;

export type Hidden = Set<ColumnId>;

export type Order = ColumnId[];

export type SortOrder = SortRule[];

export interface GridState {
    available: Columns;
    columns: Columns;
    filter: Filter;
    hidden: Hidden;
    order: Order;
    size: ColumnWidthConfig;
    sort: SortOrder;
    visible: Columns;
}
