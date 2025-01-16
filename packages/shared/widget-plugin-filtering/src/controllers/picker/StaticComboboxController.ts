import { useCombobox, UseComboboxProps } from "downshift";
import { ActionValue, DynamicValue, EditableValue } from "mendix";
import { autorun, makeAutoObservable, observable, reaction } from "mobx";
import { disposeFx } from "../../mobx-utils";
import { OptionsSerializer } from "../../stores/picker/OptionsSerializer";
import { StaticSelectFilterStore } from "../../stores/picker/StaticSelectFilterStore";
import { ResetHandler, SetValueHandler } from "../../typings/IJSActionsControlled";
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

export class StaticComboboxController {
    private actionHelper: PickerJSActionsHelper;
    private changeHelper: PickerChangeHelper;
    private defaultValue?: Iterable<string>;
    private filterStore: StaticSelectFilterStore;
    private serializer: OptionsSerializer;
    private touched = false;

    filterOptions: Array<CustomOption<DynamicValue<string>>>;
    inputValue: string;
    inputPlaceholder: string;

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
        this.inputValue = this.selectedOption?.caption ?? "";
        makeAutoObservable(this, {
            useComboboxProps: false,
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
            reaction(
                (): string => this.selectedOption?.caption ?? "",
                caption => this.setInputValue(caption)
            )
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
