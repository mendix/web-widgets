type Col = number;

type Row = number;

export type Position = [Col, Row];

export type PositionString = `${Col},${Row}`;

export type KeyCode = "ArrowUp" | "ArrowRight" | "ArrowDown" | "ArrowLeft" | "PageUp" | "PageDown" | "End" | "Home";

function relativeTop([c, r]: Position): Position {
    return [c, Math.max(0, r - 1)];
}

function relativeBottom([c, r]: Position): Position {
    return [c, r + 1];
}

function relativeLeft([c, r]: Position): Position {
    return [Math.max(0, c - 1), r];
}

function relativeRight([c, r]: Position): Position {
    return [c + 1, r];
}

function colStart([c]: Position): Position {
    return [c, 0];
}

function colEnd([c]: Position): Position {
    return [c, -1];
}

function rowStart([_, r]: Position): Position {
    return [0, r];
}

function rowEnd([_, r]: Position): Position {
    return [-1, r];
}

function firstCell(): Position {
    // First "cell" starts on second row...
    return [0, 0];
}

function lastCell(): Position {
    return [-1, -1];
}

const keyCodeSet = new Set<KeyCode>([
    "ArrowUp",
    "ArrowRight",
    "ArrowDown",
    "ArrowLeft",
    "PageUp",
    "PageDown",
    "End",
    "Home"
]);

export function posString(col: number, row: number): PositionString {
    return `${col},${row}`;
}

export function posFromString(pos: PositionString): [Col, Row] {
    const [c, r] = pos.split(",");
    return [parseInt(c, 10), parseInt(r, 10)];
}

export const keyToPositionUpdaterMap: Record<KeyCode, (event: React.KeyboardEvent) => (pos: Position) => Position> = {
    ArrowUp: () => relativeTop,
    ArrowRight: () => relativeRight,
    ArrowDown: () => relativeBottom,
    ArrowLeft: () => relativeLeft,
    PageUp: () => colStart,
    PageDown: () => colEnd,
    End: ({ ctrlKey }) => (ctrlKey ? lastCell : rowEnd),
    Home: ({ ctrlKey }) => (ctrlKey ? firstCell : rowStart)
};

export function isTrigger(code: string): code is KeyCode {
    return keyCodeSet.has(code as KeyCode);
}
