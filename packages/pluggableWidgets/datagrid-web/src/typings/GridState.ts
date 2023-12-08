import { ColumnId, GridColumn } from "./GridColumn";
import { SortRule } from "./GridSettings";

export interface ColumnWidthConfig {
    [columnId: ColumnId]: number | undefined;
}

export type ColumnsById = Record<ColumnId, GridColumn>;

export type GridState = {
    sort: SortRule[];
    columnsSize: ColumnWidthConfig;
    columnsAvailable: GridColumn[];
    columnsHidden: Set<ColumnId>;
    columnsOrder: ColumnId[];
    columns: ColumnsById;
    columnsVisible: GridColumn[];
};
