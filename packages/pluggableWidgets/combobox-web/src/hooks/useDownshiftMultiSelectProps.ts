import {
    UseComboboxProps,
    UseComboboxReturnValue,
    UseComboboxState,
    UseComboboxStateChangeOptions,
    UseMultipleSelectionReturnValue,
    useCombobox,
    useMultipleSelection
} from "downshift";
import { useMemo, useCallback } from "react";
import { A11yStatusMessage, MultiSelector } from "../helpers/types";

export type UseDownshiftMultiSelectPropsReturnValue = UseMultipleSelectionReturnValue<string> &
    Pick<
        UseComboboxReturnValue<string>,
        | "isOpen"
        | "reset"
        | "getToggleButtonProps"
        | "getMenuProps"
        | "getInputProps"
        | "highlightedIndex"
        | "getItemProps"
        | "inputValue"
        | "setInputValue"
    > & {
        items: string[];
        toggleSelectedItem: (index: number) => void;
    };

interface Options {
    labelId?: string;
    inputId?: string;
}

export function useDownshiftMultiSelectProps(
    selector: MultiSelector,
    options: Options,
    a11yStatusMessage: A11yStatusMessage
): UseDownshiftMultiSelectPropsReturnValue {
    const {
        getSelectedItemProps,
        getDropdownProps,
        removeSelectedItem,
        setActiveIndex,
        selectedItems,
        setSelectedItems,
        activeIndex,
        addSelectedItem
    } = useMultipleSelection({
        selectedItems: selector.currentValue ?? [],
        itemToString: (v: string) => selector.caption.get(v),
        getA11yRemovalMessage(options) {
            return `${options.itemToString(options.removedSelectedItem)} has been removed.`;
        },
        onSelectedItemsChange({ selectedItems }) {
            selector.setValue(selectedItems ?? []);
        },

        onStateChange({ selectedItems: newSelectedItems, type }) {
            switch (type) {
                case useMultipleSelection.stateChangeTypes.SelectedItemKeyDownBackspace:
                case useMultipleSelection.stateChangeTypes.SelectedItemKeyDownDelete:
                case useMultipleSelection.stateChangeTypes.DropdownKeyDownBackspace:
                case useMultipleSelection.stateChangeTypes.FunctionRemoveSelectedItem:
                    setSelectedItems(newSelectedItems!);
                    break;
                default:
                    break;
            }
        }
    });

    const items = selector.getOptions();

    const {
        isOpen,
        reset,
        getToggleButtonProps,
        getMenuProps,
        getInputProps,
        highlightedIndex,
        getItemProps,
        inputValue,
        setInputValue,
        closeMenu
    } = useCombobox(
        useComboboxProps(
            selector,
            selectedItems,
            items,
            removeSelectedItem,
            setSelectedItems,
            a11yStatusMessage,
            options
        )
    );

    const toggleSelectedItem = (index: number): void => {
        const item = items[index];
        if (item) {
            if (selectedItems.includes(item)) {
                removeSelectedItem(item);
                setInputValue("");
            } else {
                addSelectedItem(item);
                setInputValue("");
            }
        }
    };

    selector.onLeaveEvent = useCallback(closeMenu, [closeMenu]);

    return {
        isOpen,
        reset,
        getToggleButtonProps,
        getMenuProps,
        getInputProps,
        highlightedIndex,
        getItemProps,
        inputValue,
        setInputValue,
        getSelectedItemProps,
        getDropdownProps,
        removeSelectedItem,
        setActiveIndex,
        selectedItems,
        items,
        setSelectedItems,
        activeIndex,
        addSelectedItem,
        toggleSelectedItem
    };
}

function useComboboxProps(
    selector: MultiSelector,
    selectedItems: string[],
    items: string[],
    removeSelectedItem: (item: string) => void,
    setSelectedItems: (item: string[]) => void,
    a11yStatusMessage: A11yStatusMessage,
    options?: Options
): UseComboboxProps<string> {
    return useMemo(() => {
        return {
            items,
            selectedItem: null,
            inputId: options?.inputId,
            labelId: options?.labelId,
            onInputValueChange({ inputValue }) {
                selector.options.setSearchTerm(inputValue!);
            },
            getA11yStatusMessage(options) {
                let message =
                    selectedItems.length > 0
                        ? `${a11yStatusMessage.a11ySelectedValue} ${selectedItems
                              .map(itemId => selector.caption.get(itemId))
                              .join(",")}. `
                        : "";
                if (!options.resultCount) {
                    return a11yStatusMessage.a11yNoOption;
                }
                if (!options.isOpen) {
                    return message;
                }
                if (options.previousResultCount !== options.resultCount || !options.highlightedItem) {
                    message += `${a11yStatusMessage.a11yOptionsAvailable} ${options.resultCount}. ${a11yStatusMessage.a11yInstructions}`;
                }

                return message;
            },
            itemToString: (v: string | null) => selector.caption.get(v),
            stateReducer(state: UseComboboxState<string>, actionAndChanges: UseComboboxStateChangeOptions<string>) {
                const { changes, type } = actionAndChanges;
                switch (type) {
                    case useCombobox.stateChangeTypes.ControlledPropUpdatedSelectedItem:
                        return {
                            ...changes,
                            inputValue: state.inputValue
                        };
                    case useCombobox.stateChangeTypes.InputFocus:
                        return {
                            ...changes,
                            isOpen: state.isOpen
                        };
                    case useCombobox.stateChangeTypes.InputKeyDownEnter:
                    case useCombobox.stateChangeTypes.ItemClick:
                        return {
                            ...changes,
                            ...(changes.selectedItem && {
                                isOpen: true,
                                inputValue: "",
                                highlightedIndex: items.indexOf(changes.selectedItem)
                            })
                        };
                    case useCombobox.stateChangeTypes.InputKeyDownEscape:
                    case useCombobox.stateChangeTypes.FunctionCloseMenu:
                        return {
                            ...changes,
                            ...(changes.selectedItem && {
                                isOpen: false,
                                inputValue: "",
                                highlightedIndex: items.indexOf(changes.selectedItem)
                            })
                        };
                    case useCombobox.stateChangeTypes.InputBlur:
                        return { ...state, highlightedIndex: -1 };
                    default:
                        return changes;
                }
            },
            onStateChange({ type, selectedItem: newSelectedItems }: UseComboboxStateChangeOptions<string>) {
                switch (type) {
                    case useCombobox.stateChangeTypes.InputKeyDownEnter:
                    case useCombobox.stateChangeTypes.ItemClick:
                        if (newSelectedItems && !selectedItems.includes(newSelectedItems)) {
                            setSelectedItems([...selectedItems, newSelectedItems]);
                        } else if (newSelectedItems) {
                            removeSelectedItem(newSelectedItems);
                        }
                        break;
                    default:
                        break;
                }
            }
        };
        // disable eslint rule as probably we should update props whenever currentValue changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        selector,
        selectedItems,
        items,
        selector.currentValue,
        removeSelectedItem,
        setSelectedItems,
        a11yStatusMessage.a11ySelectedValue,
        a11yStatusMessage.a11yOptionsAvailable,
        a11yStatusMessage.a11yNoOption,
        a11yStatusMessage.a11yInstructions
    ]);
}
