import { GridColumn } from "./GridColumn";

export function sortColumns(columnsOrder: number[], columnA: GridColumn, columnB: GridColumn): number {
    let columnAValue = columnsOrder.findIndex(c => c === columnA.sourceIndex);
    let columnBValue = columnsOrder.findIndex(c => c === columnB.sourceIndex);
    if (columnAValue < 0) {
        columnAValue = columnA.sourceIndex;
    }
    if (columnBValue < 0) {
        columnBValue = columnB.sourceIndex;
    }
    return columnAValue < columnBValue ? -1 : columnAValue > columnBValue ? 1 : 0;
}
