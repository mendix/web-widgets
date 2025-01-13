import { useCombobox, UseComboboxProps } from "downshift";
import { ActionValue, EditableValue } from "mendix";
import { autorun, makeAutoObservable } from "mobx";
import { OptionsSerializer } from "../../stores/picker/OptionsSerializer";
import { StaticSelectFilterStore } from "../../stores/picker/StaticSelectFilterStore";
import { ResetHandler, SetValueHandler } from "../../typings/IJSActionsControlled";
import { OptionWithState } from "../../typings/OptionWithState";
import { PickerChangeHelper } from "../generic/PickerChangeHelper";
import { PickerJSActionsHelper } from "../generic/PickerJSActionsHelper";

interface Props {
    filterStore: StaticSelectFilterStore;
    valueAttribute?: EditableValue<string>;
    onChange?: ActionValue;
}

export class StaticComboboxController {
    private filterStore: StaticSelectFilterStore;
    private actionHelper: PickerJSActionsHelper;
    private changeHelper: PickerChangeHelper;
    private touched = false;
    inputValue: string;
    inputPlaceholder = "Select item...";

    constructor(props: Props) {
        const { filterStore } = props;
        this.filterStore = filterStore;
        const serializer = new OptionsSerializer({ store: this.filterStore });
        this.actionHelper = new PickerJSActionsHelper({
            filterStore,
            parse: value => serializer.fromStorableValue(value) ?? [],
            multiselect: false
        });
        this.changeHelper = new PickerChangeHelper(props, () => serializer.value);
        this.inputValue = this.selectedOption?.caption ?? "";
        makeAutoObservable(this, {
            useComboboxProps: false
        });
    }

    setup(): () => void {
        const disposers: Array<() => void> = [];
        disposers.push(
            autorun(() => {
                const { touched, inputValue } = this;
                if (touched) {
                    this.filterStore.search.setBuffer(inputValue);
                } else {
                    this.filterStore.search.clear();
                }
            })
        );
        disposers.push(this.changeHelper.setup());
        return () => {
            disposers.forEach(dispose => dispose());
            disposers.length = 0;
        };
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

    get isEmpty(): boolean {
        return this.filterStore.selected.size === 0;
    }

    setTouched(value: boolean): void {
        this.touched = value;
    }

    setInputValue(value: string): void {
        this.inputValue = value;
    }

    handleFocus = (event: React.FocusEvent<HTMLInputElement>): void => {
        event.target.select();
    };

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

    handleSetValue = (...args: Parameters<SetValueHandler>): void => {
        this.actionHelper.handleSetValue(...args);
    };

    handleResetValue = (...args: Parameters<ResetHandler>): void => {
        this.actionHelper.handleResetValue(...args);
    };
}
