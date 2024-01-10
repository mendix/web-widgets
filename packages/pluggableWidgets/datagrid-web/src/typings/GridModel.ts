import { ListValue } from "mendix";
import { FilterCondition } from "mendix/filters";
import { ColumnId, GridColumn } from "./GridColumn";

export interface ColumnWidthConfig {
    [columnId: ColumnId]: number | undefined;
}

export type SortInstruction = ListValue["sortOrder"] extends Array<infer T> ? T : never;

export type SortDirection = SortInstruction[1];

export type SortRule = [columnId: ColumnId, dir: SortDirection];

export type Columns = GridColumn[];

export type Filter = FilterCondition | undefined;

export type Hidden = Set<ColumnId>;

export type Order = ColumnId[];

export type SortOrder = SortRule[];

export interface StorableState {
    columns: Columns;
    hidden: Hidden;
    name: string;
    order: Order;
    settingsHash: string;
    size: ColumnWidthConfig;
    sort: SortOrder;
}
