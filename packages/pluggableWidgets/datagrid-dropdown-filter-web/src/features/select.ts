import deepEqual from "deep-equal";
import { useState, useCallback, useMemo } from "react";
import { Option, OptionValue } from "../utils/types";

type State = {
    inputValue: string;
    selected: OptionValue[];
};

type Actions = {
    setSelected: (nextSelected: OptionValue[]) => void;
    toggle: (value: OptionValue) => void;
};

function getInputValue(selected: Set<OptionValue>, options: Option[]): string {
    return options
        .filter(o => selected.has(o.value))
        .map(({ caption }) => caption)
        .join(",");
}

export function useSelectState(options: Option[], initialSelected: OptionValue[]): [State, Actions] {
    const [state, setState] = useState<Set<OptionValue>>(() => new Set(initialSelected));

    const setSelected = useCallback(
        (nextSelected: OptionValue[]) =>
            setState(prev => {
                const next = new Set(nextSelected);
                return deepEqual(prev, next) ? prev : next;
            }),
        []
    );

    const toggle = useCallback(
        (value: string) =>
            setState(prev => {
                if (prev.has(value)) {
                    prev.delete(value);
                } else {
                    prev.add(value);
                }
                return new Set(prev);
            }),
        []
    );

    const inputValue = getInputValue(state, options);

    const stableResult = useMemo<[State, Actions]>(
        () => [
            {
                inputValue,
                selected: [...state.values()]
            },
            {
                setSelected,
                toggle
            }
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [inputValue, state]
    );

    return stableResult;
}
