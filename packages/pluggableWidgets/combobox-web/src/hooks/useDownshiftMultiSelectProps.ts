import {
    UseComboboxProps,
    UseComboboxReturnValue,
    UseComboboxState,
    UseComboboxStateChangeOptions,
    UseMultipleSelectionReturnValue,
    useCombobox,
    useMultipleSelection
} from "downshift";
import { useMemo } from "react";
import { MultiSelector } from "../helpers/types";

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
    options?: Options
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

    const items = selector.options.getAll();

    const {
        isOpen,
        reset,
        getToggleButtonProps,
        getMenuProps,
        getInputProps,
        highlightedIndex,
        getItemProps,
        inputValue,
        setInputValue
    } = useCombobox(useComboboxProps(selector, selectedItems, items, removeSelectedItem, setSelectedItems, options));

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
            itemToString: (v: string | null) => selector.caption.get(v),
            stateReducer(_state: UseComboboxState<string>, actionAndChanges: UseComboboxStateChangeOptions<string>) {
                const { changes, type } = actionAndChanges;
                switch (type) {
                    case useCombobox.stateChangeTypes.ControlledPropUpdatedSelectedItem:
                        return {
                            ...changes,
                            inputValue: _state.inputValue
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
                    case useCombobox.stateChangeTypes.InputBlur:
                        return {
                            ...changes,
                            ...(changes.selectedItem && {
                                isOpen: false,
                                inputValue: "",
                                highlightedIndex: items.indexOf(changes.selectedItem)
                            })
                        };
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
    }, [selector, selectedItems, items, selector.currentValue, removeSelectedItem, setSelectedItems]);
}
