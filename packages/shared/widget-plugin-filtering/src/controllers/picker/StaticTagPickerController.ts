import { useCombobox, UseComboboxProps, useMultipleSelection, UseMultipleSelectionProps } from "downshift";
import { action, autorun, makeObservable, observable } from "mobx";
import { disposeFx } from "../../mobx-utils";
import { OptionWithState } from "../../typings/OptionWithState";
import { StaticBaseController, StaticBaseControllerProps } from "./StaticBaseController";

interface Props extends StaticBaseControllerProps {
    inputPlaceholder?: string;
}

export class StaticTagPickerController extends StaticBaseController {
    private touched = false;
    inputPlaceholder: string;
    inputValue = "";

    constructor(props: Props) {
        super(props);
        this.inputPlaceholder = props.inputPlaceholder ?? "Search";

        makeObservable<this, "touched">(this, {
            inputValue: observable,
            setInputValue: action,
            touched: observable,
            setTouched: action
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

        disposers.push(super.setup());
        return dispose;
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
                        return {
                            ...changes,
                            highlightedIndex: changes.inputValue !== state.inputValue ? 0 : changes.highlightedIndex
                        };
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
