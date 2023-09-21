import { GridColumn } from "./typings/GridColumn";

export function sortColumns(columnsOrder: number[], columnA: GridColumn, columnB: GridColumn): number {
    let columnAValue = columnsOrder.findIndex(c => c === columnA.columnNumber);
    let columnBValue = columnsOrder.findIndex(c => c === columnB.columnNumber);
    if (columnAValue < 0) {
        columnAValue = columnA.columnNumber;
    }
    if (columnBValue < 0) {
        columnBValue = columnB.columnNumber;
    }
    return columnAValue < columnBValue ? -1 : columnAValue > columnBValue ? 1 : 0;
}
