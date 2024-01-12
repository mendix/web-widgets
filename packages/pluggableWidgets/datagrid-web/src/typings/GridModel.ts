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

export type ColumnOrder = ColumnId[];

export type SortOrder = SortRule[];

export interface StorableState {
    columns: Columns;
    hidden: Hidden;
    name: string;
    order: ColumnOrder;
    settingsHash: string;
    size: ColumnWidthConfig;
    sortOrder: SortOrder;
}

export interface InitParams {
    filter: Filter;
    hidden: Hidden;
    order: ColumnOrder;
    size: ColumnWidthConfig;
    sortOrder: SortOrder;
}

export interface State {
    allColumns: Columns;
    availableColumns: Columns;
    visibleColumns: Columns;
    filter: Filter;
    hidden: Hidden;
    columnOrder: ColumnOrder;
    size: ColumnWidthConfig;
    sortOrder: SortOrder;
}

export type Actions = {
    toggleHidden: (id: ColumnId) => void;
    sortBy: (id: ColumnId) => void;
    swap: (arg: [a: ColumnId, b: ColumnId]) => void;
    resize: (arg: [id: ColumnId, size: number]) => void;
    setFilter: (arg: Filter) => void;
};
