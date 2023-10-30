import { useState, useRef, useEffect, useMemo, useCallback } from "react";

import { useKeyNavContext } from "./context";
import { TabAnchorTracker, Listener, TrackerEvent } from "./TabAnchorTracker";
import { PositionString, posString } from "./base";

type Props = {
    columnIndex: number;
    rowIndex: number;
    focusTarget?: () => Focusable | null;
};

interface Focusable {
    focus(): void;
}

type ElementState = {
    active: boolean;
    canFocus: boolean;
};

type ElementProps = {
    onClick: React.MouseEventHandler;
    onKeyDown: React.KeyboardEventHandler;
    onFocus: React.FocusEventHandler;
    ref: React.RefObject<Focusable>;
    tabIndex: 0 | -1;
    "data-position": string;
};

function subscribe(tracker: TabAnchorTracker, listener: Listener): () => void {
    tracker.addListener(listener);
    return () => tracker.removeListener(listener);
}

function createUpdateAction(event: TrackerEvent, elementPos: PositionString): React.SetStateAction<ElementState> {
    return prev => {
        const active = event.targetPos === elementPos;
        const canFocus = active && event.shouldFocus;

        // Always return new state if event.shouldFocus is true, to force component re-render.
        if (canFocus) {
            return { active: true, canFocus: true };
        }

        if (prev.active !== active || prev.canFocus !== canFocus) {
            return { active, canFocus };
        }

        return prev;
    };
}

export function useKeyNavProps(props: Props): ElementProps {
    const focusTargetPropRef = useRef(props.focusTarget);
    const { tracker } = useKeyNavContext();
    const pos = useMemo(() => posString(props.columnIndex, props.rowIndex), [props.columnIndex, props.rowIndex]);
    const [state, setState] = useState<ElementState>({ canFocus: false, active: tracker.anchor === pos });
    const eltRef = useRef<Focusable>(null);

    useEffect(() => subscribe(tracker, event => setState(createUpdateAction(event, pos))), [tracker, pos]);

    useEffect(() => {
        const { current: focusTarget } = focusTargetPropRef;

        if (state.canFocus) {
            const target = typeof focusTarget === "function" ? focusTarget() : eltRef.current;
            target?.focus();
        }
    }, [state]);

    return {
        ref: eltRef,
        tabIndex: state.active ? 0 : -1,
        "data-position": pos,
        onKeyDown: useCallback(event => tracker.dispatch({ type: "Keyboard", reactEvent: event }), [tracker]),
        onClick: useCallback(event => tracker.dispatch({ type: "Mouse", reactEvent: event }), [tracker]),
        onFocus: useCallback(event => tracker.dispatch({ type: "Focus", reactEvent: event }), [tracker])
    };
}
