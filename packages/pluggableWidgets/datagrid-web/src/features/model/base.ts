import { Event, EventCallable, Store } from "effector";
import { Gate } from "effector-react";
import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { Column } from "../../helpers/Column";
import { ColumnId } from "../../typings/GridColumn";
import * as Grid from "../../typings/GridState";
import { DynamicStorage } from "../storage/base";

export type Status = "pending" | "waitingDatasource" | "ready";

export type Model = {
    gate: Gate<DatagridContainerProps>;
    status: Store<Status>;
    grid: GridModel;
};

export type GridEvents = {
    hide: EventCallable<ColumnId>;
    limitChanged: Event<number>;
    nextPage: EventCallable<unknown>;
    offsetChanged: Event<number>;
    prevPage: EventCallable<unknown>;
    resize: EventCallable<[id: ColumnId, size: number]>;
    setPage: EventCallable<number>;
    sortBy: EventCallable<ColumnId>;
    swap: EventCallable<[a: ColumnId, b: ColumnId]>;
    cleanup: EventCallable<unknown>;
};

export type GridModel = GridEvents & {
    available: Store<Column[]>;
    columns: Store<Column[]>;
    currentPage: Store<number>;
    hidden: Store<Grid.Hidden>;
    order: Store<Grid.Order>;
    settingsHash: Store<string>;
    size: Store<Grid.ColumnWidthConfig>;
    sort: Store<Grid.SortOrder>;
    storage: Store<DynamicStorage>;
    visible: Store<Column[]>;
};

export type InitParams = {
    filter: Grid.Filter;
    hidden: Grid.Hidden;
    order: Grid.Order;
    size: Grid.ColumnWidthConfig;
    sort: Grid.SortOrder;
};
