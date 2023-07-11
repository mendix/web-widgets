import { useCombobox, useMultipleSelection } from "downshift";
import { useMemo } from "react";
import { MultiSelector } from "../helpers/types";

export function useMultipleSelectionProps(
    selector: MultiSelector,
    selectionType: string,
    emptyTextOption: string | undefined
) {
    const {
        getSelectedItemProps,
        getDropdownProps,
        removeSelectedItem,
        setActiveIndex,
        selectedItems,
        setSelectedItems
    } = useMultipleSelection({
        selectedItems: selector.currentValue ?? [],
        onStateChange({ selectedItems: newSelectedItems, type }) {
            switch (type) {
                case useMultipleSelection.stateChangeTypes.SelectedItemKeyDownBackspace:
                case useMultipleSelection.stateChangeTypes.SelectedItemKeyDownDelete:
                case useMultipleSelection.stateChangeTypes.DropdownKeyDownBackspace:
                case useMultipleSelection.stateChangeTypes.FunctionRemoveSelectedItem:
                    setSelectedItems(newSelectedItems!);
                    selector.setValue(newSelectedItems!);
                    break;
                default:
                    break;
            }
        }
    });
    const filteredItems = useMemo(
        () => selector.options?.getAll().filter((option: string): boolean => !selectedItems.includes(option)),
        [selectedItems]
    );
    const withCheckbox = selectionType === "checkbox";
    const items = withCheckbox ? selector.options?.getAll() : filteredItems;
    const { isOpen, reset, getMenuProps, getInputProps, highlightedIndex, getItemProps, inputValue } = useCombobox({
        items,
        initialInputValue: emptyTextOption,
        selectedItem: "",
        itemToString: (v: string | null) => selector.caption.get(v),
        stateReducer(_state, actionAndChanges) {
            const { changes, type } = actionAndChanges;
            switch (type) {
                case useCombobox.stateChangeTypes.InputKeyDownEnter:
                case useCombobox.stateChangeTypes.ItemClick:
                case useCombobox.stateChangeTypes.InputBlur:
                    return {
                        ...changes,
                        ...(changes.selectedItem && { isOpen: true }),
                        ...(!withCheckbox && { highlightedIndex: 0 })
                    };
                default:
                    return changes;
            }
        },
        onStateChange({ inputValue: newInputValue, type, selectedItem: newSelectedItem }) {
            switch (type) {
                case useCombobox.stateChangeTypes.InputKeyDownEnter:
                case useCombobox.stateChangeTypes.ItemClick:
                    if (!selectedItems.includes(newSelectedItem!)) {
                        setSelectedItems([...selectedItems, newSelectedItem!]);
                        selector.setValue([...selectedItems, newSelectedItem!]);
                    } else {
                        removeSelectedItem(newSelectedItem!);
                    }
                    break;
                case useCombobox.stateChangeTypes.InputChange:
                    selector.options.setSearchTerm(newInputValue!);
                    break;
                default:
                    break;
            }
        }
    });
    return {
        getSelectedItemProps,
        getDropdownProps,
        removeSelectedItem,
        setActiveIndex,
        selectedItems,
        isOpen,
        inputValue,
        reset,
        getMenuProps,
        getInputProps,
        highlightedIndex,
        getItemProps,
        items,
        withCheckbox
    };
}
