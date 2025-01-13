import { useCombobox, UseComboboxProps, useMultipleSelection, UseMultipleSelectionProps } from "downshift";
import { autorun, makeAutoObservable } from "mobx";
import { StaticSelectFilterStore } from "../../stores/picker/StaticSelectFilterStore";
import { OptionWithState } from "../../typings/OptionWithState";

export class StaticTagPickerController {
    private filterStore: StaticSelectFilterStore;
    private touched = false;
    inputValue: string;
    inputPlaceholder = "Select item...";

    constructor({ filterStore }: { filterStore: StaticSelectFilterStore }) {
        this.filterStore = filterStore;
        this.inputValue = "";
        makeAutoObservable(this, {
            useComboboxProps: false,
            useMultipleSelectionProps: false
        });
        autorun(() => {
            const { touched, inputValue } = this;
            if (touched) {
                this.filterStore.search.setBuffer(inputValue);
            } else {
                this.filterStore.search.clear();
            }
        });
    }

    get options(): OptionWithState[] {
        return this.filterStore.options;
    }

    get selectedItems(): OptionWithState[] {
        return this.filterStore.allOptions.filter(option => option.selected);
    }

    get defaultHighlightedIndex(): number {
        const selectedIndex = this.filterStore.options.findIndex(option => option.selected);
        return Math.max(selectedIndex, 0);
    }

    get selectedOption(): OptionWithState | null {
        return this.filterStore.allOptions.find(option => option.selected) || null;
    }

    setTouched(value: boolean): void {
        this.touched = value;
    }

    setInputValue(value: string): void {
        this.inputValue = value;
    }

    handleBlur = (): void => {
        this.setTouched(false);
        this.setInputValue("");
        this.filterStore.search.clear();
    };

    handleClear = (): void => {
        this.setTouched(false);
        this.setInputValue("");
        this.filterStore.clear();
    };

    useComboboxProps = (): UseComboboxProps<OptionWithState> => {
        const props: UseComboboxProps<OptionWithState> = {
            items: this.options,
            itemToKey: item => item?.value,
            itemToString: item => item?.caption ?? "",
            inputValue: this.inputValue,
            defaultHighlightedIndex: this.defaultHighlightedIndex,
            onInputValueChange: changes => {
                // Blur is handled by handleBlur;
                if (changes.type === useCombobox.stateChangeTypes.InputBlur) {
                    return;
                }
                if (changes.type === useCombobox.stateChangeTypes.InputChange) {
                    this.setTouched(true);
                }

                this.setInputValue(changes.inputValue);
            },
            onSelectedItemChange: ({ selectedItem, type }) => {
                if (
                    type === useCombobox.stateChangeTypes.InputBlur ||
                    type === useCombobox.stateChangeTypes.InputKeyDownEscape ||
                    !selectedItem
                ) {
                    return;
                }

                this.setTouched(false);
                this.filterStore.toggle(selectedItem.value);
            },
            stateReducer(state, { changes, type }) {
                switch (type) {
                    case useCombobox.stateChangeTypes.InputKeyDownEnter:
                    case useCombobox.stateChangeTypes.ItemClick:
                        return {
                            ...changes,
                            isOpen: true,
                            highlightedIndex: state.highlightedIndex,
                            inputValue: ""
                        };
                    default:
                        return changes;
                }
            }
        };
        return props;
    };

    useMultipleSelectionProps = (): UseMultipleSelectionProps<OptionWithState> => {
        const props: UseMultipleSelectionProps<OptionWithState> = {
            selectedItems: this.selectedItems,
            onStateChange: ({ selectedItems: newSelectedItems, type }) => {
                newSelectedItems ??= [];
                switch (type) {
                    case useMultipleSelection.stateChangeTypes.SelectedItemKeyDownBackspace:
                    case useMultipleSelection.stateChangeTypes.SelectedItemKeyDownDelete:
                    case useMultipleSelection.stateChangeTypes.DropdownKeyDownBackspace:
                    case useMultipleSelection.stateChangeTypes.FunctionRemoveSelectedItem:
                        this.filterStore.setSelected(newSelectedItems.map(item => item.value));
                        break;
                    default:
                        break;
                }
            }
        };

        return props;
    };
}
