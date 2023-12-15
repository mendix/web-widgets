import { FilterCondition } from "mendix/filters";
import { ColumnId, GridColumn } from "./GridColumn";
import { Event, EventCallable, Store } from "effector";
import { FilterState } from "@mendix/widget-plugin-filtering";

export interface ColumnWidthConfig {
    [columnId: ColumnId]: number | undefined;
}

export type SortRule = [columnId: ColumnId, dir: "asc" | "desc"];

export type Columns = GridColumn[];

export type Filter = FilterCondition | undefined;

export type Hidden = Set<ColumnId>;

export type Order = ColumnId[];

export type SortOrder = SortRule[];

export type SetColumnFilter = EventCallable<[ColumnId, FilterState]>;

export type SetHeaderFilter = EventCallable<FilterState>;

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
    setFilter: EventCallable<Filter>;
    setPage: EventCallable<number>;
    sortBy: EventCallable<ColumnId>;
    swap: EventCallable<[a: ColumnId, b: ColumnId]>;
    setColumnFilter: SetColumnFilter;
    setHeaderFilter: SetHeaderFilter;
};

export type Events = {
    cleanup: EventCallable<unknown>;
    limitChanged: Event<number>;
    offsetChanged: Event<number>;
};

export type Model<C = GridColumn, S = unknown> = {
    available: Store<C[]>;
    columns: Store<C[]>;
    currentPage: Store<number>;
    filter: Store<Filter>;
    hidden: Store<Hidden>;
    order: Store<Order>;
    settingsHash: Store<string>;
    size: Store<ColumnWidthConfig>;
    sort: Store<SortOrder>;
    storage: Store<S>;
    visible: Store<C[]>;
};
