import { useState, useCallback } from "react";
import { Option, OptionValue } from "../utils/types";

type InternalState = {
    inputValue: string;
    selected: Set<OptionValue>;
};

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
    const [state, setState] = useState<InternalState>(() => {
        const selected = new Set(initialSelected);
        const inputValue = getInputValue(selected, options);

        return { inputValue, selected };
    });

    const setSelected = useCallback(
        (nextSelected: OptionValue[]) => setState(prev => ({ ...prev, selected: new Set(nextSelected) })),
        []
    );

    const toggle = useCallback(
        (value: string) =>
            setState(prev => {
                if (prev.selected.has(value)) {
                    prev.selected.delete(value);
                } else {
                    prev.selected.add(value);
                }
                return { ...prev };
            }),
        []
    );

    return [
        {
            inputValue: getInputValue(state.selected, options),
            selected: [...state.selected.values()]
        },
        {
            setSelected,
            toggle
        }
    ];
}
