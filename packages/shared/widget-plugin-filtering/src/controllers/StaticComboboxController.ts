import { useCombobox, UseComboboxProps } from "downshift";
import { autorun, makeAutoObservable } from "mobx";
import { StaticSelectFilterStore } from "../stores/StaticSelectFilterStore";
import { OptionWithState } from "../typings/BaseSelectStore";

export class StaticComboboxController {
    private filterStore: StaticSelectFilterStore;
    private touched = false;
    inputValue: string;
    inputPlaceholder = "Select item...";

    constructor({ filterStore }: { filterStore: StaticSelectFilterStore }) {
        this.filterStore = filterStore;
        this.inputValue = this.selectedOption?.caption ?? "";
        makeAutoObservable(this, {
            useComboboxProps: false
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

    get selectedIndex(): number {
        const index = this.filterStore.options.findIndex(option => option.selected);
        return Math.max(index, 0);
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
        console.log("handleBlur");
        this.setTouched(false);
        this.setInputValue(this.selectedOption?.caption ?? "");
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
                this.setInputValue(changes.inputValue);
                if (changes.type === useCombobox.stateChangeTypes.InputChange) {
                    this.setTouched(true);
                }
            },
            onSelectedItemChange: ({ selectedItem, type }) => {
                if (type === useCombobox.stateChangeTypes.InputBlur) {
                    return;
                }

                this.setTouched(false);
                this.filterStore.setSelected(selectedItem ? [selectedItem.value] : []);
            },
            stateReducer(state, { changes }) {
                return {
                    ...changes,
                    highlightedIndex: changes.inputValue !== state.inputValue ? 0 : changes.highlightedIndex
                };
            }
        };
        return props;
    };
}
