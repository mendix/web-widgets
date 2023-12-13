import { Event, EventCallable, Store } from "effector";
import { Gate } from "effector-react";
import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { Column } from "../../helpers/Column";
import { ColumnId } from "../../typings/GridColumn";
import * as Grid from "../../typings/GridState";
import { DynamicStorage } from "../storage/base";

export type Status = "pending" | "ready";

export type Model = {
    gate: Gate<DatagridContainerProps>;
    status: Store<Status>;
    grid: GridModel;
};

export type GridModel = {
    available: Store<Column[]>;
    columns: Store<Column[]>;
    hidden: Store<Grid.Hidden>;
    hide: EventCallable<ColumnId>;
    order: Store<Grid.Order>;
    resize: EventCallable<[id: ColumnId, size: number]>;
    settingsHash: Store<string>;
    size: Store<Grid.ColumnWidthConfig>;
    sort: Store<Grid.SortOrder>;
    sortBy: EventCallable<ColumnId>;
    storage: Store<DynamicStorage>;
    swap: EventCallable<[a: ColumnId, b: ColumnId]>;
    visible: Store<Column[]>;
    currentPage: Store<number>;
    setPage: EventCallable<number>;
    nextPage: EventCallable<unknown>;
    prevPage: EventCallable<unknown>;
    limitChanged: Event<number>;
    offsetChanged: Event<number>;
};

export type InitParams = {
    filter: Grid.Filter;
    hidden: Grid.Hidden;
    order: Grid.Order;
    size: Grid.ColumnWidthConfig;
    sort: Grid.SortOrder;
};
