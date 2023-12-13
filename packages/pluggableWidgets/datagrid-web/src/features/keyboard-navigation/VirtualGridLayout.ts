import { PositionString, posString, Position } from "./position";

export class VirtualGridLayout {
    readonly rows: number;
    readonly columns: number;
    readonly pageSize: number;
    private _positions: Set<PositionString>;

    constructor(rows: number, columns: number, pageSize: number) {
        this.columns = columns;
        this.rows = rows;
        this.pageSize = pageSize;
        this._positions = new Set();

        for (let row = 0; row < rows; row += 1) {
            for (let col = 0; col < columns; col += 1) {
                this._positions.add(posString(col, row));
            }
        }
    }

    get([col, row]: Position): PositionString | undefined {
        const colIndex = col < 0 ? this.columns + col : col;
        const rowIndex = row < 0 ? this.rows + row : row;

        const pos = posString(colIndex, rowIndex);

        if (this._positions.has(pos)) {
            return pos;
        }
    }
}
