import { UseSelectProps, useSelect } from "downshift";
import { OptionWithState } from "../../typings/OptionWithState";
import { RefBaseController, RefBaseControllerProps } from "./RefBaseController";

const none = "[[__none__]]" as const;

export class RefSelectController extends RefBaseController {
    readonly emptyOption = {
        value: none,
        caption: "None",
        selected: false
    };

    constructor(props: RefBaseControllerProps) {
        super(props);
        this.emptyOption.caption = props.emptyCaption || "None";
    }

    get options(): OptionWithState[] {
        return [this.emptyOption, ...this.filterStore.options];
    }

    get value(): string {
        const selected = this.options.filter(option => option.selected);

        if (selected.length < 1) {
            return "Select";
        }

        return selected.map(option => option.caption).join(", ");
    }

    handleClear = (): void => {
        this.filterStore.clear();
    };

    handleFocus = (): void => {
        this.filterStore.setTouched(true);
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
}
