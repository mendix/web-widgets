import { useCombobox, UseComboboxProps } from "downshift";
import { action, autorun, computed, makeObservable, observable, reaction } from "mobx";
import { disposeFx } from "../../mobx-utils";
import { OptionWithState } from "../../typings/OptionWithState";
import { RefBaseController, RefBaseControllerProps } from "./RefBaseController";

interface Props extends RefBaseControllerProps {
    inputPlaceholder?: string;
}

export class RefComboboxController extends RefBaseController {
    private touched = false;
    inputValue: string;
    inputPlaceholder: string;

    constructor(props: Props) {
        super({ ...props, multiselect: false });
        this.inputPlaceholder = props.inputPlaceholder ?? "Search";
        this.inputValue = this.selectedOption?.caption ?? "";

        makeObservable<this, "touched" | "setTouched">(this, {
            inputValue: observable,
            touched: observable,
            setTouched: action,
            selectedIndex: computed,
            selectedOption: computed,
            setInputValue: action,
            handleBlur: action,
            handleClear: action,
            handleFocus: action
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

        // Set input when selected option changes
        disposers.push(
            reaction(
                (): string => this.selectedOption?.caption ?? "",
                caption => this.setInputValue(caption)
            )
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

    private setTouched(value: boolean): void {
        this.touched = value;
    }

    setInputValue(value: string): void {
        this.inputValue = value;
    }

    handleFocus = (event: React.FocusEvent<HTMLInputElement>): void => {
        event.target.select();
        this.filterStore.setFetchReady(true);
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
}
