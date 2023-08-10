import {
    useCombobox,
    UseComboboxState,
    UseComboboxStateChangeOptions,
    UseComboboxStateChange,
    UseComboboxReturnValue,
    UseComboboxProps
} from "downshift";

import { useMemo } from "react";
import { SingleSelector } from "../helpers/types";
import { executeAction } from "@mendix/pluggable-widgets-commons";
import { ActionValue } from "mendix";

export function useDownshiftSingleSelectProps(
    selector: SingleSelector,
    onChangeEvent?: ActionValue
): UseComboboxReturnValue<string> {
    const downshiftProps: UseComboboxProps<string> = useMemo(() => {
        return {
            items: [],
            itemToString: (v: string | null) => selector.caption.get(v),
            onSelectedItemChange({ selectedItem }: UseComboboxStateChange<string>) {
                executeAction(onChangeEvent);
                selector.setValue(selectedItem ?? null);
            },
            onInputValueChange({ inputValue }) {
                selector.options.setSearchTerm(inputValue!);
            },
            defaultHighlightedIndex: 0,
            selectedItem: null,
            initialInputValue: selector.caption.get(selector.currentValue),
            stateReducer(state: UseComboboxState<string>, actionAndChanges: UseComboboxStateChangeOptions<string>) {
                const { changes, type } = actionAndChanges;
                console.log(type);

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
                        return { ...changes, inputValue: "" };

                    case useCombobox.stateChangeTypes.InputKeyDownEscape:
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
            }
        };
    }, [selector, onChangeEvent]);

    return useCombobox({
        ...downshiftProps,
        items: selector.options.getAll() ?? [],
        selectedItem: selector.currentValue
    });
}
