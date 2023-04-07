import { ChangeEventHandler, useState, useMemo } from "react";
import { FilterType } from "../../typings/FilterType";
// import type { Big } from "big.js";

type FilterState = {
    type: FilterType;
    inputValue: string;
};

type InputChangeHandler = ChangeEventHandler<HTMLInputElement>;

type TypeClickHandler = (type: FilterType) => void;

function updateState<K extends keyof S, V extends S[K], S>(key: K, value: V): (prev: S) => S {
    return prev => (prev[key] !== value ? { ...prev, [key]: value } : prev);
}

export function useFilterState(initialState: () => FilterState): [FilterState, InputChangeHandler, TypeClickHandler] {
    const [state, setState] = useState(initialState);
    const [onInputChange, onTypeClick] = useMemo(() => {
        const inputHandler: InputChangeHandler = event => setState(updateState("inputValue", event.target.value));
        const clickHandler: TypeClickHandler = type => setState(updateState("type", type));

        return [inputHandler, clickHandler];
    }, []);

    return [state, onInputChange, onTypeClick];
}

// type ChangeDispatch = (value: Big | undefined, type: FilterType) => void;

// function useStateChangeEffects(state: FilterState, dispatch:) {
//     const [state, setState] = useFilterState();
// }
