import { GridState } from "../../typings/GridState";
import { ColumnId, GridColumn, SortInstruction } from "../../typings/GridColumn";

export interface InitViewState {
    filter?: undefined;
    sortOrder?: SortInstruction[];
}

export type ComputedInitState = [initState: GridState, initView: InitViewState] | [initState: GridState];

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
