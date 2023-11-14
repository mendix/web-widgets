import * as P from "./position";
import { TargetEvent } from "./base";
import { VirtualGridLayout } from "./VirtualGridLayout";

const keyCodeSet = new Set([
    "ArrowUp",
    "ArrowRight",
    "ArrowDown",
    "ArrowLeft",
    "PageUp",
    "PageDown",
    "End",
    "Home"
] as const);

type KeyCode = typeof keyCodeSet extends Set<infer R> ? R : never;

function isNavKey(code: string): code is KeyCode {
    return keyCodeSet.has(code as KeyCode);
}

type FindPositionFn = (targePos: P.Position, layout: VirtualGridLayout, event: React.KeyboardEvent) => P.Position;

export const keyHandlers: Record<KeyCode, FindPositionFn> = {
    ArrowUp: P.relativeTop,
    ArrowRight: P.relativeRight,
    ArrowDown: P.relativeBottom,
    ArrowLeft: P.relativeLeft,
    PageUp: (pos, layout) => P.pageUp(pos, layout.pageSize),
    PageDown: (pos, layout) => P.pageDown(pos, layout.pageSize, layout.rows),
    End: (pos, _, { ctrlKey }) => (ctrlKey ? P.lastCell() : P.rowEnd(pos)),
    Home: (pos, _, { ctrlKey }) => (ctrlKey ? P.firstCell() : P.rowStart(pos))
};

export class PositionController {
    dispatch(event: TargetEvent, layout: VirtualGridLayout): P.PositionString | undefined {
        if (event.type === "Focus") {
            return this._handleFocusEvent(event.reactEvent);
        }

        if (event.type === "Mouse") {
            return this._handleMouseEvent(event.reactEvent);
        }

        return this._handleKeyboardEvent(event.reactEvent, layout);
    }

    private _handleKeyboardEvent(event: React.KeyboardEvent, layout: VirtualGridLayout): P.PositionString | undefined {
        if (!isNavKey(event.code)) {
            return;
        }

        if (!Object.hasOwn(keyHandlers, event.code)) {
            throw new Error(`Keyboard nav: can't find handler for ${event.code} key`);
        }

        event.preventDefault();
        const targetPos = P.posFromString(this._getTargetPosition(event));

        return layout.get(keyHandlers[event.code](targetPos, layout, event));
    }

    private _handleMouseEvent(event: React.MouseEvent): P.PositionString | undefined {
        return this._getTargetPosition(event);
    }

    private _handleFocusEvent(event: React.FocusEvent): P.PositionString | undefined {
        return this._getTargetPosition(event);
    }

    private _getTargetPosition(event: { currentTarget: Element }): P.PositionString {
        const targetPos = (event.currentTarget as HTMLElement).dataset?.position as P.PositionString;

        if (targetPos === undefined) {
            throw new Error("Keyboard navigation: target position is missing");
        }

        return targetPos;
    }
}
