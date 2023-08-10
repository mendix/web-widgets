import {
    UseComboboxProps,
    UseComboboxState,
    UseComboboxStateChangeOptions,
    useCombobox,
    useMultipleSelection
} from "downshift";
import { useMemo } from "react";
import { MultiSelector } from "../helpers/types";

export function useDownshiftMultiSelectProps(selector: MultiSelector, inputElement: HTMLInputElement | null) {
    const {
        getSelectedItemProps,
        getDropdownProps,
        removeSelectedItem,
        setActiveIndex,
        selectedItems,
        setSelectedItems
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
    const filteredItems = selector.options?.getAll().filter(option => !selectedItems.includes(option));

    const items = selector.withCheckbox ? selector.options?.getAll() : filteredItems;

    const {
        isOpen,
        reset,
        getToggleButtonProps,
        getMenuProps,
        getInputProps,
        highlightedIndex,
        getItemProps,
        inputValue
    } = useCombobox(
        useComboboxProps(selector, selectedItems, inputElement, items, removeSelectedItem, setSelectedItems)
    );

    return {
        isOpen,
        reset,
        getToggleButtonProps,
        getMenuProps,
        getInputProps,
        highlightedIndex,
        getItemProps,
        inputValue,
        getSelectedItemProps,
        getDropdownProps,
        removeSelectedItem,
        setActiveIndex,
        selectedItems,
        items,
        setSelectedItems
    };
}

function useComboboxProps(
    selector: MultiSelector,
    selectedItems: string[],
    inputElement: HTMLInputElement | null,
    items: string[],
    removeSelectedItem: (item: string) => void,
    setSelectedItems: (item: string[]) => void
): UseComboboxProps<string> {
    return useMemo(() => {
        return {
            items,
            selectedItem: null,
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
                            inputValue: ""
                        };

                    case useCombobox.stateChangeTypes.InputKeyDownEscape:
                    case useCombobox.stateChangeTypes.InputKeyDownEnter:
                    case useCombobox.stateChangeTypes.ItemClick:
                    case useCombobox.stateChangeTypes.InputBlur:
                        return {
                            ...changes,
                            ...(changes.selectedItem && { isOpen: true, inputValue: "" }),
                            ...(selector.withCheckbox &&
                                changes.selectedItem && { highlightedIndex: items.indexOf(changes.selectedItem) })
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
    }, [selector, selectedItems, items, inputElement, selector.currentValue]);
}
