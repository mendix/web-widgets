import { useSelect, UseSelectProps } from "downshift";
import { action, computed, makeObservable } from "mobx";
import { OptionWithState } from "../../typings/OptionWithState";
import { GConstructor } from "../../typings/type-utils";

export interface FilterStore {
    toggle: (value: string) => void;
    clear: () => void;
    setSelected: (value: Iterable<string>) => void;
    selected: Set<string>;
    options: OptionWithState[];
    selectedOptions: OptionWithState[];
}

type BaseController = GConstructor<{
    filterStore: FilterStore;
    multiselect: boolean;
}>;

const none = "[[__none__]]" as const;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function SelectControllerMixin<TBase extends BaseController>(Base: TBase) {
    return class SelectControllerMixin extends Base {
        emptyCaption = "";

        readonly emptyOption = {
            value: none,
            caption: "",
            selected: false
        };

        constructor(...args: any[]) {
            super(...args);
            makeObservable(this, {
                options: computed,
                isEmpty: computed,
                value: computed,
                handleClear: action
            });
        }

        get options(): OptionWithState[] {
            if (this.multiselect) {
                return this.filterStore.options;
            }
            return [this.emptyOption, ...this.filterStore.options];
        }

        get isEmpty(): boolean {
            return this.filterStore.selected.size === 0;
        }

        get value(): string {
            const selected = this.filterStore.selectedOptions;

            if (selected.length < 1) {
                return this.emptyCaption;
            }

            return selected.map(option => option.caption).join(", ");
        }

        handleClear = (): void => {
            this.filterStore.clear();
        };

        useSelectProps = (): UseSelectProps<OptionWithState> => {
            const props: UseSelectProps<OptionWithState> = {
                items: this.options,
                itemToKey: item => item?.value,
                itemToString: item => item?.caption ?? "",
                onSelectedItemChange: ({ selectedItem }) => {
                    if (!selectedItem) {
                        return;
                    }
                    if (selectedItem.value === none) {
                        this.filterStore.clear();
                    } else if (this.multiselect) {
                        this.filterStore.toggle(selectedItem.value);
                    } else {
                        this.filterStore.setSelected([selectedItem.value]);
                    }
                }
            };

            if (this.multiselect) {
                props.stateReducer = (state, { changes, type }) => {
                    switch (type) {
                        case useSelect.stateChangeTypes.ToggleButtonClick:
                            if (state.isOpen) {
                                return {
                                    ...changes,
                                    isOpen: true,
                                    highlightedIndex: state.highlightedIndex
                                };
                            }

                            return {
                                ...changes
                            };
                        case useSelect.stateChangeTypes.ToggleButtonKeyDownEnter:
                        case useSelect.stateChangeTypes.ItemClick:
                            return {
                                ...changes,
                                isOpen: true,
                                highlightedIndex: state.highlightedIndex
                            };
                        default:
                            return changes;
                    }
                };
            }
            return props;
        };
    };
}
