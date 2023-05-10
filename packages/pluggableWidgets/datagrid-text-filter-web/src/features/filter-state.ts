import { ChangeEventHandler, useState, useMemo, useRef, useEffect, MutableRefObject } from "react";
import { FilterType } from "../../typings/FilterType";
import { debounce, useEventCallback } from "@mendix/pluggable-widgets-commons";

type FilterState = {
    type: FilterType;
    inputValue: string;
};

type FilterChangeFns = {
    onInputChange: ChangeEventHandler<HTMLInputElement>;
    onTypeClick: (type: FilterType) => void;
    onReset: () => void;
};

function updateState<K extends keyof S, V extends S[K], S>(key: K, value: V): (prev: S) => S {
    return prev => (prev[key] !== value ? { ...prev, [key]: value } : prev);
}

export function useFilterState(initialState: () => FilterState): [FilterState, FilterChangeFns] {
    const [state, setState] = useState(initialState);
    const changeFns = useMemo<FilterChangeFns>(
        () => ({
            onInputChange: event => setState(updateState("inputValue", event.target.value)),
            onTypeClick: type => setState(updateState("type", type)),
            onReset: () => setState(updateState("inputValue", ""))
        }),
        []
    );

    return [state, changeFns];
}

type ChangeDispatch = (value: string | undefined, type: FilterType) => void;

export function useStateChangeEffects(
    state: FilterState,
    dispatch: ChangeDispatch,
    inputChangeDelay: number
): [MutableRefObject<HTMLInputElement | null>] {
    const stableDispatch = useEventCallback(dispatch);
    const [stableDispatchDelayed] = useState(() => debounce(stableDispatch, inputChangeDelay));
    const inputRef = useRef<HTMLInputElement | null>(null);
    const prevStateRef = useRef(state);

    useEffect(() => {
        const { current: prevState } = prevStateRef;
        if (state.type !== prevState.type) {
            stableDispatch(state.inputValue, state.type);
            inputRef.current?.focus();
        } else if (state.inputValue !== prevState.inputValue) {
            stableDispatchDelayed(state.inputValue, state.type);
        }
        prevStateRef.current = state;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state]);

    return [inputRef];
}
