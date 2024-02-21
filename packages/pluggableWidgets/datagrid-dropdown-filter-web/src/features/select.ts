import deepEqual from "deep-equal";
import { useState, useMemo } from "react";
import { Option, OptionValue } from "../utils/types";

type State = {
    inputValue: string;
    selected: OptionValue[];
};

type Actions = {
    setSelected: (nextSelected: OptionValue[]) => void;
    toggle: (value: OptionValue) => void;
    reset: () => void;
};

function getInputValue(selected: Set<OptionValue>, options: Option[]): string {
    return options
        .filter(o => selected.has(o.value))
        .map(({ caption }) => caption)
        .join(",");
}

export function useSelectState(options: Option[], initialSelected: OptionValue[]): [State, Actions] {
    const [state, setState] = useState<Set<OptionValue>>(() => new Set(initialSelected));

    const actions: Actions = useMemo(
        () => ({
            setSelected: (nextSelected: OptionValue[]) =>
                setState(prev => {
                    const next = new Set(nextSelected);
                    return deepEqual(prev, next) ? prev : next;
                }),
            toggle: (value: string) =>
                setState(prev => {
                    if (prev.has(value)) {
                        prev.delete(value);
                    } else {
                        prev.add(value);
                    }
                    return new Set(prev);
                }),
            reset: () => setState(new Set())
        }),
        []
    );

    const inputValue = getInputValue(state, options);

    const outerState: State = useMemo(
        () => ({
            inputValue,
            selected: [...state.values()]
        }),
        [state, inputValue]
    );

    return [outerState, actions];
}
