import { useCombobox, UseComboboxProps } from "downshift";
import { action, autorun, computed, makeObservable, observable, reaction } from "mobx";
import { disposeFx } from "../../../mobx-utils";
import { SearchStore } from "../../../stores/picker/SearchStore";
import { OptionWithState } from "../../../typings/OptionWithState";
import { GConstructor } from "../../../typings/type-utils";

export interface FilterStore {
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
export function ComboboxControllerMixin<TBase extends BaseController>(Base: TBase) {
    return class ComboboxControllerMixin extends Base {
        touched = false;
        inputValue = "";
        inputPlaceholder = "";

        constructor(...args: any[]) {
            super(...args);

            makeObservable(this, {
                inputValue: observable,
                setInputValue: action,
                touched: observable,
                setTouched: action,
                selectedIndex: computed,
                selectedOption: computed,
                isEmpty: computed,
                options: computed,
                handleBlur: action,
                handleClear: action
            });
        }

        setup(): () => void {
            const [disposers, dispose] = disposeFx();
            disposers.push(autorun(...this.searchSyncFx()));

            // Set input when store state changes
            disposers.push(reaction(...this.storeSyncFx()));

            disposers.push(super.setup());
            this.setInputValue(this.inputInitValue);
            return dispose;
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

        storeSyncFx(): Parameters<typeof reaction> {
            const data = (): string => this.selectedOption?.caption ?? "";
            const effect = (caption: string): void => {
                if (!this.touched) {
                    this.setInputValue(caption);
                }
            };
            return [data, effect];
        }

        get options(): OptionWithState[] {
            return this.filterStore.options;
        }

        get isEmpty(): boolean {
            return this.filterStore.selected.size === 0;
        }

        get selectedIndex(): number {
            const index = this.filterStore.options.findIndex(option => option.selected);
            return Math.max(index, 0);
        }

        get selectedOption(): OptionWithState | null {
            return this.filterStore.selectedOptions.at(0) ?? null;
        }

        get inputInitValue(): string {
            if (this.selectedOption) {
                return this.selectedOption.caption;
            }
            if (this.filterStore.selected.size === 0) {
                return "";
            } else {
                return "1 item selected (but not applied)";
            }
        }

        setTouched(value: boolean): void {
            this.touched = value;
        }

        setInputValue(value: string): void {
            this.inputValue = value;
        }

        handleFocus(event: React.FocusEvent<HTMLInputElement>): void {
            event.target.select();
        }

        handleBlur = (): void => {
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
                items: this.filterStore.options,
                itemToKey: item => item?.value,
                itemToString: item => item?.caption ?? "",
                inputValue: this.inputValue,
                defaultHighlightedIndex: this.selectedIndex,
                onInputValueChange: changes => {
                    // Blur is handled by handleBlur;
                    if (changes.type === useCombobox.stateChangeTypes.InputBlur) {
                        return;
                    }
                    if (changes.type === useCombobox.stateChangeTypes.InputKeyDownEscape) {
                        this.handleClear();
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
                        type === useCombobox.stateChangeTypes.InputKeyDownEscape
                    ) {
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
    };
}
