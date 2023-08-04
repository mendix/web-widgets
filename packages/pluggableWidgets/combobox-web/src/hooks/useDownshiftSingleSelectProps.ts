import {
    useCombobox,
    UseComboboxState,
    UseComboboxStateChangeOptions,
    UseComboboxStateChange,
    UseComboboxProps,
    UseComboboxReturnValue
} from "downshift";

import { useMemo } from "react";
import { Selector } from "../helpers/types";
import { executeAction } from "@mendix/pluggable-widgets-commons";
import { ActionValue } from "mendix";

export function useDownshiftSingleSelectProps(
    selector: Selector<string>,
    setInputValue: (value: string) => void,
    inputElement: HTMLInputElement | null,
    onChangeEvent?: ActionValue
): UseComboboxReturnValue<string> {
    const downshiftProps = useMemo((): UseComboboxProps<string> => {
        return {
            items: [],
            itemToString: (v: string | null) => selector.caption.get(v),
            onSelectedItemChange(changes: UseComboboxStateChange<string>) {
                executeAction(onChangeEvent);
                selector.setValue(changes.selectedItem!);
            },
            defaultHighlightedIndex: 0,
            selectedItem: null,
            initialInputValue: selector.caption.get(selector.currentValue),
            stateReducer(state: UseComboboxState<string>, actionAndChanges: UseComboboxStateChangeOptions<string>) {
                const { changes, type } = actionAndChanges;
                switch (type) {
                    case useCombobox.stateChangeTypes.ToggleButtonClick:
                        return {
                            ...changes,
                            inputValue:
                                state.isOpen && selector.currentValue ? selector.caption.get(selector.currentValue) : ""
                        };

                    case useCombobox.stateChangeTypes.ControlledPropUpdatedSelectedItem:
                        return {
                            ...changes,
                            inputValue:
                                changes.inputValue === selector.caption.emptyCaption
                                    ? ""
                                    : selector.caption.get(selector.currentValue)
                        };

                    case useCombobox.stateChangeTypes.InputFocus:
                        setInputValue("");
                        return { ...changes, inputValue: "" };

                    case useCombobox.stateChangeTypes.InputBlur:
                    case undefined:
                        return {
                            ...changes,
                            inputValue:
                                changes.selectedItem || selector.currentValue
                                    ? selector.caption.get(selector.currentValue)
                                    : ""
                        };

                    default:
                        return { ...changes };
                }
            },
            onStateChange({ type, inputValue }) {
                switch (type) {
                    case useCombobox.stateChangeTypes.InputChange:
                        selector.options.setSearchTerm(inputValue!);
                        setInputValue(inputValue!);
                        break;

                    case useCombobox.stateChangeTypes.ToggleButtonClick:
                        inputElement?.focus();
                }
            }
        };
    }, [selector, inputElement, onChangeEvent]);
    return useCombobox({
        ...downshiftProps,
        items: selector.options.getAll() ?? [],
        selectedItem: selector.currentValue
    });
}
