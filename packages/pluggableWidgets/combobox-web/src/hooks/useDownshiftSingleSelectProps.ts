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

interface Options {
    inputId?: string;
    labelId?: string;
}

export function useDownshiftSingleSelectProps(
    selector: SingleSelector,
    options: Options = {}
): UseComboboxReturnValue<string> {
    const { inputId, labelId } = options;

    const downshiftProps: UseComboboxProps<string> = useMemo(() => {
        return {
            items: [],
            itemToString: (v: string | null) => selector.caption.get(v),
            onSelectedItemChange({ selectedItem }: UseComboboxStateChange<string>) {
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
            },
            inputId,
            labelId
        };
    }, [selector, inputId, labelId]);

    return useCombobox({
        ...downshiftProps,
        items: selector.options.getAll() ?? [],
        selectedItem: selector.currentValue
    });
}
