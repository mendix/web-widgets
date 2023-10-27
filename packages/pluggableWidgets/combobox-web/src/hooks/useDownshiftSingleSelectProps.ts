import {
    UseComboboxProps,
    UseComboboxReturnValue,
    UseComboboxState,
    UseComboboxStateChange,
    UseComboboxStateChangeOptions,
    useCombobox
} from "downshift";

import { useMemo } from "react";
import { A11yStatusMessage, SingleSelector } from "../helpers/types";

interface Options {
    inputId?: string;
    labelId?: string;
}

export function useDownshiftSingleSelectProps(
    selector: SingleSelector,
    options: Options = {},
    a11yStatusMessage: A11yStatusMessage
): UseComboboxReturnValue<string> {
    const { inputId, labelId } = options;

    const downshiftProps: UseComboboxProps<string> = useMemo(() => {
        return {
            items: [],
            itemToString: (v: string | null) => selector.caption.get(v),
            onSelectedItemChange({ selectedItem }: UseComboboxStateChange<string>) {
                selector.setValue(selectedItem ?? null);
                if (inputId) {
                    document.getElementById(inputId)?.blur();
                }
            },
            onInputValueChange({ inputValue }) {
                selector.options.setSearchTerm(inputValue!);
            },
            getA11yStatusMessage(options) {
                const selectedItem = selector.caption.get(selector.currentValue);
                let message = selectedItem ? `${a11yStatusMessage.a11ySelectedValue} ${selectedItem}. ` : "";

                if (options.resultCount > 0) {
                    message += `${a11yStatusMessage.a11yOptionsAvailable} ${options.resultCount}. ${a11yStatusMessage.a11yInstructions}`;
                } else {
                    message += a11yStatusMessage.a11yNoOption;
                }

                return message;
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
                        return {
                            ...changes,
                            isOpen: state.isOpen,
                            inputValue: "",
                            highlightedIndex: changes.selectedItem ? -1 : this.defaultHighlightedIndex
                        };

                    case useCombobox.stateChangeTypes.InputKeyDownEscape:
                    case useCombobox.stateChangeTypes.InputBlur:
                    case undefined:
                        return {
                            ...changes,
                            isOpen: false,
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
