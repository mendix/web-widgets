import { UseSelectProps } from "downshift";
import { StaticSelectFilterStore } from "../stores/StaticSelectFilterStore";
import { OptionWithState } from "../typings/BaseSelectStore";

const none = "__none__" as const;

export class StaticSelectController {
    private filterStore: StaticSelectFilterStore;

    readonly emptyOption = {
        value: none,
        caption: "None",
        selected: false
    };

    readonly useEmptyOption: boolean = false;

    constructor({ filterStore }: { filterStore: StaticSelectFilterStore; useEmptyOption?: boolean }) {
        this.filterStore = filterStore;
        this.useEmptyOption = true;
    }

    get options(): OptionWithState[] {
        if (!this.useEmptyOption) {
            return this.filterStore.options;
        }

        return [this.emptyOption, ...this.filterStore.options];
    }

    triggerValue(): string {
        const selected = this.options.filter(option => option.selected);

        if (selected.length < 1) {
            return "Select item";
        }

        return selected.map(option => option.caption).join(", ");
    }

    getSelectProps = (): UseSelectProps<OptionWithState> => {
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
}
