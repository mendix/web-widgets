import { PositionString, posString, posFromString, isTrigger as isTriggerKey, keyToPositionUpdaterMap } from "./base";
import { VirtualGridLayout } from "./VirtualGridLayout";

// import { tabbable } from "tabbable";

type Event =
    | {
          type: "Mouse";
          reactEvent: React.MouseEvent;
      }
    | {
          type: "Keyboard";
          reactEvent: React.KeyboardEvent;
      };

export type TrackerEvent = { targetPos: PositionString; shouldFocus: boolean };
export type Listener = (event: TrackerEvent) => void;

export class TabAnchorTracker {
    private _listeners: Listener[];
    private _layout: VirtualGridLayout;
    private _anchor: PositionString;

    constructor(layout: VirtualGridLayout) {
        this._listeners = [];
        this._layout = layout;
        this._anchor = this._getInitPosition();
    }

    get anchor(): PositionString {
        return this._anchor;
    }

    addListener(listener: Listener): void {
        this._listeners.push(listener);
    }

    removeListener(listener: Listener): void {
        this._listeners.splice(this._listeners.indexOf(listener), 1);
    }

    dispatch(event: Event): void {
        if (event.type === "Keyboard") {
            this._handleKeyboardEvent(event.reactEvent);
        } else {
            this._handleMouseEvent(event.reactEvent);
        }
    }

    updateGridLayout(layout: VirtualGridLayout): void {
        this._layout = layout;

        if (this._layout.get(posFromString(this._anchor)) === undefined) {
            this._setAnchor(this._getInitPosition());
        }
    }

    private _getPosition(event: { currentTarget: Element }): PositionString {
        const targetPos = (event.currentTarget as HTMLElement).dataset?.position as PositionString;

        if (targetPos === undefined) {
            throw new Error("Keyboard navigation: target position is missing");
        }

        return targetPos;
    }

    private _setAnchor(pos: PositionString): void {
        this._anchor = pos;
        for (const listener of this._listeners) {
            listener({ targetPos: pos, shouldFocus: false });
        }
    }

    private _setAnchorAndFocus(pos: PositionString): void {
        this._anchor = pos;
        for (const listener of this._listeners) {
            listener({ targetPos: pos, shouldFocus: true });
        }
    }

    private _getInitPosition(): PositionString {
        return posString(0, 0);
    }

    private _handleKeyboardEvent(event: React.KeyboardEvent): void {
        // if (event.code === "Tab") {
        //     const pos = this._getPosition(event);
        //     const lastTabbableChild = tabbable(event.currentTarget).at(-1);
        //     if (event.target === lastTabbableChild) {
        //         event.stopPropagation();
        //         event.preventDefault();
        //         this._setAnchorAndFocus(pos);
        //     }
        // }

        if (!isTriggerKey(event.code)) {
            return;
        }

        if (!Object.hasOwn(keyToPositionUpdaterMap, event.code)) {
            throw new Error(`Keyboard nav: can't find position updater for ${event.code} key`);
        }

        event.preventDefault();
        event.stopPropagation();
        const updatePosition = keyToPositionUpdaterMap[event.code](event);
        const pos = posFromString(this._getPosition(event));
        const nextAnchor = this._layout.get(updatePosition(pos));

        if (nextAnchor === undefined || nextAnchor === this._anchor) {
            return;
        }

        this._setAnchorAndFocus(nextAnchor);
    }

    private _handleMouseEvent(event: React.MouseEvent): void {
        const pos = this._getPosition(event);

        if (pos === this._anchor) {
            return;
        }

        this._setAnchorAndFocus(pos);
    }
}
