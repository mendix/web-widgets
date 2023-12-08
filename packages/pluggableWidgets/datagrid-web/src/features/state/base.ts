import { ColumnId, GridColumn } from "../../typings/GridColumn";

export type OrderUpdate = React.SetStateAction<ColumnId[]>;

export type HiddenUpdate = React.SetStateAction<Set<ColumnId>>;

export type SizeUpdate = [ColumnId, number];

export type UpdateFunctions = {
    setOrder: React.Dispatch<OrderUpdate>;
    setHidden: React.Dispatch<HiddenUpdate>;
    setColumns: React.Dispatch<GridColumn[]>;
    setSort: React.Dispatch<ColumnId>;
    setSize: React.Dispatch<SizeUpdate>;
};
