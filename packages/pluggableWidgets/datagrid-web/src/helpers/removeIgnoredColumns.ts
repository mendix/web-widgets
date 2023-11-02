import { GridColumn } from "../typings/GridColumn";

export function removeIgnoredColumns(columns: GridColumn[]): GridColumn[] {
    return columns.reduce((cols, column) => {
        if (column.ignored === false) {
            return [...cols, column];
        }

        return cols;
    }, []);
}
