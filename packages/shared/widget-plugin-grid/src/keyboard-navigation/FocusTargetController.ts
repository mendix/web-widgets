import { PositionController } from "./PositionController";
import { VirtualGridLayout } from "./VirtualGridLayout";
import { TargetEvent } from "./base";
import { PositionString, posString, posFromString } from "./position";

export type FocusTargetUpdateEvent = { lastPos: PositionString; targetPos: PositionString; shouldFocus: boolean };

export type Listener = (event: FocusTargetUpdateEvent) => void;

export class FocusTargetController {
    private _listeners: Listener[];
    private _focusTarget: PositionString;
    private _positionController: PositionController;
    private _layout: VirtualGridLayout;

    constructor(pos: PositionController, layout: VirtualGridLayout) {
        this._listeners = [];
        this._focusTarget = this._getInitPosition();
        this._positionController = pos;
        this._layout = layout;
    }

    get focusTarget(): PositionString {
        return this._focusTarget;
    }

    addListener(listener: Listener): void {
        this._listeners.push(listener);
    }

    removeListener(listener: Listener): void {
        this._listeners.splice(this._listeners.indexOf(listener), 1);
    }

    updateGridLayout(layout: VirtualGridLayout): void {
        this._layout = layout;

        if (this._layout.get(posFromString(this._focusTarget)) === undefined) {
            this._setTarget(this._getInitPosition());
        }
    }

    dispatch = (event: TargetEvent): void => {
        const next = this._positionController.dispatch(event, this._layout);

        if (next === undefined || next === this._focusTarget) {
            return;
        }

        if (event.type === "Keyboard") {
            this._setTargetAndFocus(next);
        } else {
            this._setTarget(next);
        }
    };

    private _setTarget(pos: PositionString): void {
        const lastPos = this._focusTarget;
        this._focusTarget = pos;
        this._emit({ lastPos, targetPos: pos, shouldFocus: false });
    }

    private _setTargetAndFocus(pos: PositionString): void {
        const lastPos = this._focusTarget;
        this._focusTarget = pos;
        this._emit({ lastPos, targetPos: pos, shouldFocus: true });
    }

    private _emit(event: FocusTargetUpdateEvent): void {
        for (const listener of this._listeners) {
            listener(event);
        }
    }

    private _getInitPosition(): PositionString {
        return posString(0, 0);
    }
}
