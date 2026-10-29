import {
    useCombobox,
    UseComboboxProps,
    UseComboboxReturnValue,
    UseComboboxState,
    UseComboboxStateChange,
    UseComboboxStateChangeOptions
} from "downshift";

import { useCallback, useMemo } from "react";
import { ComboboxCore } from "../core/ComboboxCore";
import { SingleSelector } from "../helpers/types";

interface Options {
    inputId?: string;
    labelId?: string;
}

export function useDownshiftSingleSelectProps(
    core: ComboboxCore<SingleSelector>,
    options: Options = {}
): UseComboboxReturnValue<string> {
    const { selector, t } = core;
    const { inputId, labelId } = options;

    const downshiftProps: UseComboboxProps<string> = useMemo(() => {
        return {
            items: [],
            itemToString: (v: string | null) => selector.caption.get(v),
            onSelectedItemChange({ selectedItem }: UseComboboxStateChange<string>) {
                selector.setValue(selectedItem ?? null);
            },
            onInputValueChange({ inputValue, type }: UseComboboxStateChange<string>) {
                if (type === useCombobox.stateChangeTypes.InputChange) {
                    core.setInputValue(inputValue!);
                } else {
                    selector.options.setSearchTerm("");
                }
            },
            getA11yStatusMessage(options) {
                const selectedItem = selector.caption.get(selector.currentId);
                let message = selectedItem
                    ? selector.currentId
                        ? `${t("a11ySelectedValue", selectedItem)}. `
                        : "No options selected."
                    : "";
                if (!options.isOpen) {
                    return message;
                }
                if (!options.resultCount) {
                    return t("a11yNoOption");
                }
                if (options.resultCount > 0) {
                    message += `${t("a11yOptionsAvailable", options.resultCount)}. ${t("a11yInstructions")}`;
                } else {
                    return t("a11yNoOption");
                }

                return message;
            },
            defaultHighlightedIndex: 0,
            selectedItem: null,
            initialInputValue: selector.caption.get(selector.currentId),
            stateReducer(state: UseComboboxState<string>, actionAndChanges: UseComboboxStateChangeOptions<string>) {
                const { changes, type } = actionAndChanges;
                switch (type) {
                    // clear input when user toggles (closes) dropdown.
                    case useCombobox.stateChangeTypes.ToggleButtonClick:
                        return {
                            ...changes,
                            inputValue: ""
                        };

                    // when item is selected, downshift fills in input automatically, prevent that.
                    case useCombobox.stateChangeTypes.FunctionSelectItem:
                    case useCombobox.stateChangeTypes.ItemClick:
                    case useCombobox.stateChangeTypes.ControlledPropUpdatedSelectedItem:
                    case useCombobox.stateChangeTypes.InputKeyDownEnter:
                        return {
                            ...changes,
                            inputValue: ""
                        };

                    case useCombobox.stateChangeTypes.InputFocus:
                        return {
                            ...changes,
                            isOpen: state.isOpen,
                            inputValue: "",
                            highlightedIndex: changes.selectedItem ? -1 : this.defaultHighlightedIndex
                        };

                    // clear input when user want to close the popup with escape (or it was closed programmatically)
                    case useCombobox.stateChangeTypes.InputKeyDownEscape:
                    case useCombobox.stateChangeTypes.FunctionCloseMenu:
                        return {
                            ...changes,
                            selectedItem: state.selectedItem,
                            isOpen: false,
                            inputValue: ""
                        };
                    case useCombobox.stateChangeTypes.InputBlur:
                        return state;
                    default:
                        return { ...changes };
                }
            },
            inputId,
            labelId
        };
    }, [core, selector, inputId, labelId, t]);

    const returnVal = useCombobox({
        ...downshiftProps,
        items: selector.options.getAll() ?? [],
        selectedItem: selector.currentId
    });

    const { closeMenu } = returnVal;

    selector.onLeaveEvent = useCallback(closeMenu, [closeMenu]);

    return returnVal;
}
