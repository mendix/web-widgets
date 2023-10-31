import { useState, useRef, useEffect, useMemo, useCallback } from "react";

import { useKeyNavContext } from "./context";
import { Listener } from "./FocusTargetController";
import { posString } from "./position";

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

export function useFocusTargetProps(props: Props): ElementProps {
    const focusTargetPropRef = useRef(props.focusTarget);
    const { focusController } = useKeyNavContext();
    const [active, pos] = useMemo(() => {
        const pos = posString(props.columnIndex, props.rowIndex);
        return [pos === focusController.focusTarget, pos];
    }, [props.columnIndex, props.rowIndex, focusController.focusTarget]);
    const [state, setState] = useState<ElementState>({ canFocus: false });
    const eltRef = useRef<Focusable>(null);

    useEffect(() => {
        const listener: Listener = event =>
            setState(prev => {
                if (event.lastPos === pos) {
                    return { canFocus: false };
                }
                if (event.targetPos === pos) {
                    return { canFocus: event.shouldFocus };
                }
                return prev;
            });
        focusController.addListener(listener);
        return () => focusController.removeListener(listener);
    }, [focusController, pos]);

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
        onKeyDown: useCallback(
            event => focusController.dispatch({ type: "Keyboard", reactEvent: event }),
            [focusController]
        ),
        onClick: useCallback(
            event => focusController.dispatch({ type: "Mouse", reactEvent: event }),
            [focusController]
        ),
        onFocus: useCallback(event => focusController.dispatch({ type: "Focus", reactEvent: event }), [focusController])
    };
}
