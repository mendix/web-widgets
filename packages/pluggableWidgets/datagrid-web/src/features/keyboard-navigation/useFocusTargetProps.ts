import { useState, useRef, useEffect, useMemo } from "react";

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

type ElementProps<T extends Focusable> = {
    ref: React.RefObject<T>;
    tabIndex: 0 | -1;
    "data-position": string;
};

export function useFocusTargetProps<T extends Focusable = Focusable>(props: Props): ElementProps<T> {
    const eltRef = useRef<T>(null);
    const focusTargetPropRef = useRef(props.focusTarget);
    const { focusController } = useKeyNavContext();
    const [active, pos] = useMemo(() => {
        const pos = posString(props.columnIndex, props.rowIndex);
        return [pos === focusController.focusTarget, pos];
    }, [props.columnIndex, props.rowIndex, focusController.focusTarget]);
    const [state, setState] = useState<ElementState>({ canFocus: false });

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
        "data-position": pos
    };
}
