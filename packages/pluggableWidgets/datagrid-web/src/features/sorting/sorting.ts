import { ListValue } from "mendix";
import { ColumnId } from "../columns/GridColumn";

export type SortInstruction = ListValue["sortOrder"] extends Array<infer T> ? T : never;

export type SortDirection = SortInstruction[1];

export type SortRule = [columnId: ColumnId, dir: SortDirection];
