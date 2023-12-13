import { EventCallable, Store } from "effector";
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
    hideColumn: EventCallable<ColumnId>;
    order: Store<Grid.Order>;
    settingsHash: Store<string>;
    sort: Store<Grid.SortOrder>;
    storage: Store<DynamicStorage>;
    swapColumns: EventCallable<{ a: ColumnId; b: ColumnId }>;
    visible: Store<Column[]>;
};

export type InitParams = {
    filter: Grid.Filter;
    hidden: Grid.Hidden;
    order: Grid.Order;
    size: Grid.ColumnWidthConfig;
    sort: Grid.SortOrder;
};
