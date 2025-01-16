import { useCombobox, UseComboboxProps, useMultipleSelection, UseMultipleSelectionProps } from "downshift";
import { ActionValue, DynamicValue, EditableValue } from "mendix";
import { autorun, makeAutoObservable, observable } from "mobx";
import { disposeFx } from "../../mobx-utils";
import { OptionsSerializer } from "../../stores/picker/OptionsSerializer";
import { StaticSelectFilterStore } from "../../stores/picker/StaticSelectFilterStore";
import { IJSActionsControlled, ResetHandler, SetValueHandler } from "../../typings/IJSActionsControlled";
import { OptionWithState } from "../../typings/OptionWithState";
import { PickerChangeHelper } from "../generic/PickerChangeHelper";
import { PickerJSActionsHelper } from "../generic/PickerJSActionsHelper";

interface Props {
    defaultValue?: string;
    filterOptions: Array<CustomOption<DynamicValue<string>>>;
    filterStore: StaticSelectFilterStore;
    onChange?: ActionValue;
    valueAttribute?: EditableValue<string>;
    inputPlaceholder?: string;
}

interface CustomOption<T> {
    caption: T;
    value: T;
}

export class StaticTagPickerController implements IJSActionsControlled {
    private actionHelper: PickerJSActionsHelper;
    private changeHelper: PickerChangeHelper;
    private defaultValue?: Iterable<string>;
    private filterStore: StaticSelectFilterStore;
    private serializer: OptionsSerializer;
    private touched = false;
    filterOptions: Array<CustomOption<DynamicValue<string>>>;
    inputPlaceholder: string;
    inputValue = "";

    constructor(props: Props) {
        this.inputPlaceholder = props.inputPlaceholder ?? "Search";
        this.filterOptions = props.filterOptions;
        this.filterStore = props.filterStore;
        this.serializer = new OptionsSerializer({ store: this.filterStore });
        this.defaultValue = this.serializer.fromStorableValue(props.defaultValue);
        this.actionHelper = new PickerJSActionsHelper({
            filterStore: props.filterStore,
            parse: value => this.serializer.fromStorableValue(value) ?? [],
            multiselect: false
        });
        this.changeHelper = new PickerChangeHelper(props, () => this.serializer.value);
        makeAutoObservable(this, {
            useComboboxProps: false,
            useMultipleSelectionProps: false,
            setup: false,
            filterOptions: observable.struct
        });
    }

    setup(): () => void {
        const [disposers, dispose] = disposeFx();
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
        disposers.push(
            autorun(() => {
                if (this.filterOptions.length > 0) {
                    const options = this.filterOptions.map(this.toStoreOption);
                    this.filterStore.setCustomOptions(options);
                }
            })
        );
        disposers.push(this.changeHelper.setup());

        // Set default after all reactions are set up
        if (this.defaultValue) {
            this.filterStore.setDefaultSelected(this.defaultValue);
        }
        return dispose;
    }

    updateProps(props: Props): void {
        this.changeHelper.updateProps(props);
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

    get selectedItems(): OptionWithState[] {
        return this.filterStore.allOptions.filter(option => option.selected);
    }

    get isEmpty(): boolean {
        return this.filterStore.selected.size === 0;
    }

    toStoreOption = (opt: CustomOption<DynamicValue<string>>): CustomOption<string> => ({
        caption: `${opt.caption?.value}`,
        value: `${opt.value?.value}`
    });

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

    handleSetValue = (...args: Parameters<SetValueHandler>): void => {
        this.actionHelper.handleSetValue(...args);
    };

    handleResetValue = (...args: Parameters<ResetHandler>): void => {
        this.actionHelper.handleResetValue(...args);
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
