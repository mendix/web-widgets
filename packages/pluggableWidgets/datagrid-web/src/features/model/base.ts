import { Event, EventCallable, Store } from "effector";
import { Gate } from "effector-react";
import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { Column } from "../../helpers/Column";
import * as Grid from "../../typings/GridModel";
import { DynamicStorage } from "../storage/base";

export type Status = "pending" | "waitingDatasource" | "ready";

export type Model = {
    gate: Gate<DatagridContainerProps>;
    status: Store<Status>;
    grid: GridModel;
};

export type GridStores = {
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

export type GridModel = Grid.Actions & Grid.Events & GridStores;

export type InitParams = {
    filter: Grid.Filter;
    hidden: Grid.Hidden;
    order: Grid.Order;
    size: Grid.ColumnWidthConfig;
    sort: Grid.SortOrder;
};
