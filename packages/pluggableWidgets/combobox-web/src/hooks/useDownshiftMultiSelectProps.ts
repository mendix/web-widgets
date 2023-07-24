import {
    UseComboboxProps,
    UseComboboxState,
    UseComboboxStateChangeOptions,
    useCombobox,
    useMultipleSelection
} from "downshift";
import { useCallback, useMemo } from "react";
import { MultiSelector } from "../helpers/types";
import { executeAction } from "@mendix/pluggable-widgets-commons";
import { ActionValue } from "mendix";

export function useDownshiftMultiSelectProps(
    selector: MultiSelector,
    setInput: (value: string) => void,
    selectionType: string,
    onChangeEvent: ActionValue | undefined,
    inputElement: HTMLInputElement | null
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
        onSelectedItemsChange: useCallback(() => {
            executeAction(onChangeEvent);
        }, [onChangeEvent]),
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

    const { isOpen, reset, getMenuProps, getInputProps, highlightedIndex, getItemProps, inputValue, toggleMenu } =
        useCombobox(
            useComboboxProps(
                selector,
                selectedItems,
                inputElement,
                items,
                withCheckbox,
                setSelectedItems,
                removeSelectedItem,
                setInput
            )
        );

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
        toggleMenu,
        items,
        withCheckbox
    };
}

function useComboboxProps(
    selector: MultiSelector,
    selectedItems: string[],
    inputElement: HTMLInputElement | null,
    items: string[],
    withCheckbox: boolean,
    setSelectedItems: (items: string[]) => void,
    removeSelectedItem: (item: string) => void,
    setInput: (input: string) => void
) {
    return useMemo((): UseComboboxProps<string> => {
        return {
            items,
            selectedItem: null,
            itemToString: (v: string | null) => selector.caption.get(v),
            stateReducer(_state: UseComboboxState<string>, actionAndChanges: UseComboboxStateChangeOptions<string>) {
                const { changes, type } = actionAndChanges;
                switch (type) {
                    case useCombobox.stateChangeTypes.ControlledPropUpdatedSelectedItem:
                        return {
                            ...changes,
                            inputValue: ""
                        };
                    case useCombobox.stateChangeTypes.InputKeyDownEnter:
                    case useCombobox.stateChangeTypes.ItemClick:
                    case useCombobox.stateChangeTypes.InputBlur:
                        return {
                            ...changes,
                            ...(changes.selectedItem && { isOpen: true, inputValue: "" }),
                            ...(withCheckbox &&
                                changes.selectedItem && { highlightedIndex: items.indexOf(changes.selectedItem) })
                        };
                    default:
                        return changes;
                }
            },
            onStateChange({ inputValue, type, selectedItem: newSelectedItems }: UseComboboxStateChangeOptions<string>) {
                switch (type) {
                    case useCombobox.stateChangeTypes.InputKeyDownEnter:
                    case useCombobox.stateChangeTypes.ItemClick:
                        if (newSelectedItems && !selectedItems.includes(newSelectedItems)) {
                            setSelectedItems([...selectedItems, newSelectedItems]);
                            selector.setValue([...selectedItems, newSelectedItems]);
                        } else if (newSelectedItems) {
                            removeSelectedItem(newSelectedItems);
                        }
                        break;
                    case useCombobox.stateChangeTypes.InputChange:
                        selector.options.setSearchTerm(inputValue!);
                        setInput(inputValue!);
                        break;
                    default:
                        break;
                }
            }
        };
    }, [selector, selectedItems, items, withCheckbox, inputElement]);
}
