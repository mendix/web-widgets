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

interface BaseState {
    columnOrder: ColumnOrder;
    hidden: Hidden;
    size: ColumnWidthConfig;
    sortOrder: SortOrder;
}

export interface StorableState extends BaseState {
    columns: Columns;
    name: string;
    settingsHash: string;
}

export interface InitParams extends BaseState {
    filter: Filter;
}

export interface State extends BaseState {
    allColumns: Columns;
    availableColumns: Columns;
    visibleColumns: Columns;
    filter: Filter;
}

export type Actions = {
    toggleHidden: (id: ColumnId) => void;
    sortBy: (id: ColumnId) => void;
    swap: (arg: [a: ColumnId, b: ColumnId]) => void;
    resize: (arg: [id: ColumnId, size: number]) => void;
    setFilter: (arg: Filter) => void;
};
