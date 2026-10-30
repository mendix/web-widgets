import {
    useCombobox,
    UseComboboxProps,
    UseComboboxReturnValue,
    UseComboboxState,
    UseComboboxStateChange,
    UseComboboxStateChangeOptions,
    useMultipleSelection,
    UseMultipleSelectionReturnValue
} from "downshift";
import { RefObject, useCallback, useMemo } from "react";
import { ComboboxCore } from "../core/ComboboxCore";
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
    core: ComboboxCore<MultiSelector>,
    options: Options,
    inputRef: RefObject<HTMLInputElement | null>
): UseDownshiftMultiSelectPropsReturnValue {
    const { selector } = core;
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
        selectedItems: selector.currentId ?? [],
        itemToString: (v: string) => selector.caption.get(v),
        getA11yRemovalMessage(options) {
            return `${options.itemToString(options.removedSelectedItem)} has been removed.`;
        },
        onSelectedItemsChange({ selectedItems }) {
            selector.setValue(selectedItems ?? []);
        },

        onStateChange({ selectedItems: newSelectedItems, type, activeIndex: newActiveIndex }) {
            switch (type) {
                case useMultipleSelection.stateChangeTypes.SelectedItemKeyDownBackspace:
                case useMultipleSelection.stateChangeTypes.SelectedItemKeyDownDelete:
                    if (newActiveIndex === -1) {
                        inputRef.current?.focus();
                    }
                    setSelectedItems(newSelectedItems!);
                    break;
                case useMultipleSelection.stateChangeTypes.DropdownKeyDownBackspace:
                case useMultipleSelection.stateChangeTypes.FunctionRemoveSelectedItem:
                    setSelectedItems(newSelectedItems!);
                    break;
                case useMultipleSelection.stateChangeTypes.SelectedItemKeyDownNavigationNext:
                    if (newActiveIndex === -1) {
                        inputRef.current?.focus();
                    }
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
    } = useCombobox(useComboboxProps(core, selectedItems, items, removeSelectedItem, setSelectedItems, options));

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
    core: ComboboxCore<MultiSelector>,
    selectedItems: string[],
    items: string[],
    removeSelectedItem: (item: string) => void,
    setSelectedItems: (item: string[]) => void,
    options?: Options
): UseComboboxProps<string> {
    const { selector, t } = core;
    return useMemo(() => {
        return {
            items,
            selectedItem: null,
            inputId: options?.inputId,
            labelId: options?.labelId,
            onInputValueChange({ inputValue, type }: UseComboboxStateChange<string>) {
                if (type === useCombobox.stateChangeTypes.InputChange) {
                    core.setInputValue(inputValue!);
                } else {
                    selector.options.setSearchTerm(inputValue!);
                }
            },
            getA11yStatusMessage(options) {
                let message =
                    selectedItems.length > 0
                        ? `${t("a11ySelectedValue", selectedItems.map(itemId => selector.caption.get(itemId)).join(","))}. `
                        : "";
                if (!options.resultCount) {
                    return t("a11yNoOption");
                }
                if (!options.isOpen) {
                    return message;
                }
                if (options.previousResultCount !== options.resultCount || !options.highlightedItem) {
                    message += `${t("a11yOptionsAvailable", options.resultCount)}. ${t("a11yInstructions")}`;
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
        // disable eslint rule as probably we should update props whenever currentId changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [core, selector, selectedItems, items, selector.currentId, removeSelectedItem, setSelectedItems, t]);
}
