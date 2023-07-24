import Downshift, { DownshiftState, StateChangeOptions } from "downshift";
import { useMemo } from "react";
import { SingleSelector } from "../helpers/types";
import { executeAction } from "@mendix/pluggable-widgets-commons";
import { ActionValue } from "mendix";

export function useDownshiftProps(
    selector: SingleSelector,
    inputElement: HTMLInputElement | null,
    emptyOptionText: string | undefined,
    onChangeEvent?: ActionValue
) {
    return useMemo(() => {
        return {
            itemToString: (v: string | null) => selector.caption.get(v),
            onChange: (v: string | null, _stateAndHelpers: any) => {
                executeAction(onChangeEvent);
                selector.setValue(v);
            },
            onInputValueChange: (v: string) => selector.options.setSearchTerm(v),
            onStateChange: (state: StateChangeOptions<string>) => {
                if (state.type === Downshift.stateChangeTypes.clickButton && state.isOpen) {
                    inputElement?.focus();
                }
            },
            defaultHighlightedIndex: 0,
            selectedItem: selector.currentValue,
            initialInputValue: selector.caption.get(selector.currentValue),
            stateReducer: (_state: DownshiftState<string>, changes: StateChangeOptions<string>) => {
                switch (changes.type) {
                    case Downshift.stateChangeTypes.clickButton:
                        return {
                            ...changes,
                            inputValue: ""
                        };
                    case Downshift.stateChangeTypes.controlledPropUpdatedSelectedItem:
                        return {
                            ...changes,
                            inputValue:
                                changes.inputValue === emptyOptionText
                                    ? ""
                                    : selector.caption.get(selector.currentValue)
                        };
                    case Downshift.stateChangeTypes.keyDownEnter:
                    case Downshift.stateChangeTypes.clickItem:
                        return {
                            ...changes
                        };
                    case Downshift.stateChangeTypes.mouseUp:
                    case Downshift.stateChangeTypes.blurButton:
                    case undefined:
                        return {
                            ...changes,
                            inputValue:
                                changes.selectedItem || selector.caption.get(selector.currentValue) !== emptyOptionText
                                    ? selector.caption.get(selector.currentValue)
                                    : ""
                        };
                    default:
                        return { ...changes };
                }
            }
        };
    }, [selector, inputElement, emptyOptionText, selector.currentValue]);
}
