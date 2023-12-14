import { Store } from "effector";
import { Gate } from "effector-react";
import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { Column } from "../../helpers/Column";
import * as Grid from "../../typings/GridModel";
import { DynamicStorage } from "../storage/base";

export type Status = "pending" | "waitingDatasource" | "ready";

export type Model = Grid.Model<Column, DynamicStorage>;

export type GridModelApi = {
    gate: Gate<DatagridContainerProps>;
    status: Store<Status>;
    model: Model;
    actions: Grid.Actions;
    events: Grid.Events;
};

export type InitParams = {
    filter: Grid.Filter;
    hidden: Grid.Hidden;
    order: Grid.Order;
    size: Grid.ColumnWidthConfig;
    sort: Grid.SortOrder;
};
