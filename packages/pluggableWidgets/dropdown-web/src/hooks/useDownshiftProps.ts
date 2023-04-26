import Downshift, { DownshiftState, StateChangeOptions } from "downshift";
import { useMemo } from "react";
import { SingleSelector } from "../helpers/types";

export function useDownshiftProps(selector: SingleSelector, inputElement: HTMLInputElement | null) {
    return useMemo(() => {
        return {
            itemToString: (v: string | null) => selector.caption.get(v),
            onChange: (v: string | null) => selector.setValue(v),
            onInputValueChange: (v: string) => selector.options.setSearchTerm(v),
            onStateChange: (state: StateChangeOptions<string>) => {
                if (state.type === Downshift.stateChangeTypes.clickButton && state.isOpen) {
                    inputElement?.focus();
                }
            },
            initialInputValue: selector.caption.get(selector.currentValue),
            stateReducer: (_state: DownshiftState<string>, changes: StateChangeOptions<string>) => {
                switch (changes.type) {
                    case Downshift.stateChangeTypes.clickButton:
                        return {
                            ...changes,
                            inputValue: ""
                        };
                    case Downshift.stateChangeTypes.keyDownEnter:
                    case Downshift.stateChangeTypes.clickItem:
                        return {
                            ...changes
                        };
                    default:
                        return changes;
                }
            }
        };
    }, [selector, inputElement]);
}
