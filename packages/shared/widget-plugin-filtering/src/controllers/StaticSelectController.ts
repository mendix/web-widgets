import { UseSelectProps } from "downshift";
import { StaticSelectFilterStore } from "../stores/picker/StaticSelectFilterStore";
import { OptionWithState } from "../typings/BaseSelectStore";
import { IJSActionsControlled } from "../typings/IJSActionsControlled";
import { PickerJSActionsHelper } from "./PickerJSActionsHelper";

const none = "__none__" as const;

export class StaticSelectController implements IJSActionsControlled {
    private filterStore: StaticSelectFilterStore;
    private actionHelper: PickerJSActionsHelper;

    readonly emptyOption = {
        value: none,
        caption: "None",
        selected: false
    };

    constructor({ filterStore }: { filterStore: StaticSelectFilterStore }) {
        this.filterStore = filterStore;
        this.actionHelper = new PickerJSActionsHelper({
            filterStore,
            parse: value => value.split(","),
            multiselect: false
        });
    }

    get options(): OptionWithState[] {
        return [this.emptyOption, ...this.filterStore.options];
    }

    get value(): string {
        const selected = this.options.filter(option => option.selected);

        if (selected.length < 1) {
            return "Select item";
        }

        return selected.map(option => option.caption).join(", ");
    }

    handleClear = (): void => {
        this.filterStore.clear();
    };

    useSelectProps = (): UseSelectProps<OptionWithState> => {
        return {
            items: this.options,
            itemToKey: item => item?.value,
            itemToString: item => item?.caption ?? "",
            onSelectedItemChange: ({ selectedItem }) => {
                if (!selectedItem) {
                    return;
                }
                const multiselect = false;
                if (multiselect) {
                    this.filterStore.toggle(selectedItem.value);
                } else {
                    const selected = selectedItem.value === none ? [] : [selectedItem.value];
                    this.filterStore.setSelected(selected);
                }
            }
        };
    };

    handleSetValue = (...args: Parameters<IJSActionsControlled["handleSetValue"]>): void => {
        this.actionHelper.handleSetValue(...args);
    };

    handleResetValue = (...args: Parameters<IJSActionsControlled["handleResetValue"]>): void => {
        this.actionHelper.handleResetValue(...args);
    };
}
