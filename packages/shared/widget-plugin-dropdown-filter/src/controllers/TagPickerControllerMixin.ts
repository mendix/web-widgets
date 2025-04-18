import { disposeBatch } from "@mendix/widget-plugin-mobx-kit/disposeBatch";
import { useCombobox, UseComboboxProps, useMultipleSelection, UseMultipleSelectionProps } from "downshift";
import { action, autorun, computed, makeObservable, observable } from "mobx";
import { SearchStore } from "../stores/SearchStore";
import { OptionWithState } from "../typings/OptionWithState";
import { GConstructor } from "../typings/type-utils";

export interface FilterStore {
    toggle: (value: string) => void;
    clear: () => void;
    setSelected: (value: Iterable<string>) => void;
    selected: Set<string>;
    options: OptionWithState[];
    selectedOptions: OptionWithState[];
    search: SearchStore;
}

type BaseController = GConstructor<{
    filterStore: FilterStore;
    multiselect: boolean;
    setup(): () => void;
}>;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function TagPickerControllerMixin<TBase extends BaseController>(Base: TBase) {
    return class TagPickerControllerMixin extends Base {
        touched = false;
        inputPlaceholder = "Search";
        filterSelectedOptions = false;
        inputValue = "";

        constructor(...args: any[]) {
            super(...args);
            makeObservable(this, {
                touched: observable,
                inputValue: observable,
                setTouched: action,
                setInputValue: action,
                handleBlur: action,
                handleClear: action,
                options: computed,
                selectedIndex: computed,
                selectedOptions: computed,
                isEmpty: computed
            });
        }

        setup(): () => void {
            const [add, disposeAll] = disposeBatch();

            add(super.setup());
            add(autorun(...this.searchSyncFx()));

            return disposeAll;
        }

        searchSyncFx(): Parameters<typeof autorun> {
            const effect = (): void => {
                const { touched, inputValue } = this;
                if (touched) {
                    this.filterStore.search.setBuffer(inputValue);
                } else {
                    this.filterStore.search.clear();
                }
            };

            return [effect];
        }

        get options(): OptionWithState[] {
            const options = this.filterStore.options;
            return this.filterSelectedOptions ? options.filter(option => !option.selected) : options;
        }

        get isEmpty(): boolean {
            return this.filterStore.selected.size === 0;
        }

        get selectedIndex(): number {
            const index = this.filterStore.options.findIndex(option => option.selected);
            return Math.max(index, 0);
        }

        get selectedOptions(): OptionWithState[] {
            return this.filterStore.selectedOptions;
        }

        setTouched(touched: boolean): void {
            this.touched = touched;
        }

        setInputValue(value: string): void {
            this.inputValue = value;
        }

        handleBlur = (): void => {
            this.setInputValue("");
            this.setTouched(false);
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
                defaultHighlightedIndex: this.selectedIndex,
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
                    this.filterStore.toggle(selectedItem.value);
                },
                stateReducer(state, { changes, type }) {
                    switch (type) {
                        case useCombobox.stateChangeTypes.ItemClick:
                            return {
                                ...changes,
                                isOpen: true,
                                highlightedIndex: state.highlightedIndex
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
                selectedItems: this.selectedOptions,
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
    };
}
