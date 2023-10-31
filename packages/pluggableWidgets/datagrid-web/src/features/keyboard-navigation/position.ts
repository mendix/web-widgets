type Col = number;

type Row = number;

export type Position = [Col, Row];

export type PositionString = `${Col},${Row}`;

export function posString(col: number, row: number): PositionString {
    return `${col},${row}`;
}

export function posFromString(pos: PositionString): [Col, Row] {
    const [c, r] = pos.split(",");
    return [parseInt(c, 10), parseInt(r, 10)];
}

export function relativeTop([c, r]: Position): Position {
    return [c, Math.max(0, r - 1)];
}

export function relativeBottom([c, r]: Position): Position {
    return [c, r + 1];
}

export function relativeLeft([c, r]: Position): Position {
    return [Math.max(0, c - 1), r];
}

export function relativeRight([c, r]: Position): Position {
    return [c + 1, r];
}

export function rowStart([_, r]: Position): Position {
    return [0, r];
}

export function rowEnd([_, r]: Position): Position {
    return [-1, r];
}

export function pageUp([c, r]: Position, pageSize: number): Position {
    return [c, Math.max(0, r - pageSize)];
}

export function pageDown([c, r]: Position, pageSize: number, rows: number): Position {
    return [c, Math.min(rows - 1, r + pageSize)];
}

export function firstCell(): Position {
    return [0, 0];
}

export function lastCell(): Position {
    return [-1, -1];
}
