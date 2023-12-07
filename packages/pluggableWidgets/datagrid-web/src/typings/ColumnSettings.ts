import { ColumnId } from "./GridColumn";

export interface ColumnSettings {
    columnId: ColumnId;
    size: number | undefined;
    filterSettings: unknown;
}
