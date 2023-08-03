import {
    useCombobox,
    UseComboboxState,
    UseComboboxStateChangeOptions,
    UseComboboxStateChange,
    UseComboboxProps
} from "downshift";

import { useMemo } from "react";
import { Selector } from "../helpers/types";
import { executeAction } from "@mendix/pluggable-widgets-commons";
import { ActionValue } from "mendix";

export function useDownshiftSingleSelectProps(
    selector: Selector<string>,
    inputElement: HTMLInputElement | null,
    emptyOptionText: string | undefined,
    setInputValue: (value: string) => void,
    onChangeEvent?: ActionValue
) {
    const downshiftProps = useMemo((): UseComboboxProps<string> => {
        return {
            items: selector.options.getAll() ?? [],
            itemToString: (v: string | null) => selector.caption.get(v),
            onSelectedItemChange(changes: UseComboboxStateChange<string>) {
                executeAction(onChangeEvent);
                selector.setValue(changes.selectedItem!);
            },
            defaultHighlightedIndex: 0,
            selectedItem: selector.currentValue,
            initialInputValue: selector.caption.get(selector.currentValue),
            stateReducer(_state: UseComboboxState<string>, actionAndChanges: UseComboboxStateChangeOptions<string>) {
                const { changes, type } = actionAndChanges;
                switch (type) {
                    case useCombobox.stateChangeTypes.ToggleButtonClick:
                        return {
                            ...changes,
                            inputValue: ""
                        };

                    case useCombobox.stateChangeTypes.ControlledPropUpdatedSelectedItem:
                        return {
                            ...changes,
                            inputValue:
                                changes.inputValue === emptyOptionText
                                    ? ""
                                    : selector.caption.get(selector.currentValue)
                        };

                    case useCombobox.stateChangeTypes.InputFocus:
                        setInputValue("");
                        return { ...changes, inputValue: "" };

                    case useCombobox.stateChangeTypes.InputKeyDownEscape:
                    case useCombobox.stateChangeTypes.InputBlur:
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
            },
            onStateChange({ type, inputValue }) {
                switch (type) {
                    case useCombobox.stateChangeTypes.InputChange:
                        selector.options.setSearchTerm(inputValue!);
                        setInputValue(inputValue!);
                }
            }
        };
    }, [selector, inputElement, emptyOptionText, onChangeEvent, selector.currentValue]);
    return useCombobox(downshiftProps);
}
