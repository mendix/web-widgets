import { FilterCondition } from "mendix/filters";
import { ColumnId, GridColumn } from "./GridColumn";
import { Event, EventCallable } from "effector";

export interface ColumnWidthConfig {
    [columnId: ColumnId]: number | undefined;
}

export type SortRule = [columnId: ColumnId, dir: "asc" | "desc"];

export type Columns = GridColumn[];

export type Filter = FilterCondition | undefined;

export type Hidden = Set<ColumnId>;

export type Order = ColumnId[];

export type SortOrder = SortRule[];

export interface StorableState {
    settingsHash: string;
    columns: Columns;
    hidden: Hidden;
    order: Order;
    size: ColumnWidthConfig;
    sort: SortOrder;
}

export interface ViewModel<T extends GridColumn = GridColumn> {
    available: T[];
    columns: T[];
    currentPage: number;
    filter: Filter;
    hidden: Hidden;
    order: Order;
    size: ColumnWidthConfig;
    sort: SortOrder;
    visible: T[];
}

export type Actions = {
    hide: EventCallable<ColumnId>;
    mapPage: EventCallable<(n: number) => number>;
    nextPage: EventCallable<unknown>;
    prevPage: EventCallable<unknown>;
    resize: EventCallable<[id: ColumnId, size: number]>;
    setPage: EventCallable<number>;
    sortBy: EventCallable<ColumnId>;
    swap: EventCallable<[a: ColumnId, b: ColumnId]>;
};

export type Events = {
    cleanup: EventCallable<unknown>;
    limitChanged: Event<number>;
    offsetChanged: Event<number>;
};
