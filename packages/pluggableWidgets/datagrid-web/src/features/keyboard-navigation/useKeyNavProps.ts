import { useState, useRef, useEffect, useMemo, useCallback } from "react";

import { useKeyNavContext } from "./context";
import { TabAnchorTracker, Listener } from "./TabAnchorTracker";
import { posString } from "./base";

type Props = {
    columnIndex: number;
    rowIndex: number;
    focusTarget?: () => Focusable | null;
};

interface Focusable {
    focus(): void;
}

type ElementState = {
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

export function useKeyNavProps(props: Props): ElementProps {
    const focusTargetPropRef = useRef(props.focusTarget);
    const { tracker } = useKeyNavContext();
    const [active, pos] = useMemo(() => {
        const pos = posString(props.columnIndex, props.rowIndex);
        return [pos === tracker.anchor, pos];
    }, [props.columnIndex, props.rowIndex, tracker.anchor]);
    const [state, setState] = useState<ElementState>({ canFocus: false });
    const eltRef = useRef<Focusable>(null);

    useEffect(
        () =>
            subscribe(tracker, event =>
                setState(prev => {
                    if (event.lastPos === pos) {
                        return { canFocus: false };
                    }
                    if (event.targetPos === pos) {
                        return { canFocus: event.shouldFocus };
                    }
                    return prev;
                })
            ),
        [tracker, pos]
    );

    useEffect(() => {
        const { current: focusTarget } = focusTargetPropRef;

        if (state.canFocus) {
            const target = typeof focusTarget === "function" ? focusTarget() : eltRef.current;
            target?.focus();
        }
    }, [state]);

    return {
        ref: eltRef,
        tabIndex: active ? 0 : -1,
        "data-position": pos,
        onKeyDown: useCallback(event => tracker.dispatch({ type: "Keyboard", reactEvent: event }), [tracker]),
        onClick: useCallback(event => tracker.dispatch({ type: "Mouse", reactEvent: event }), [tracker]),
        onFocus: useCallback(event => tracker.dispatch({ type: "Focus", reactEvent: event }), [tracker])
    };
}
