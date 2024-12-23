import { UseSelectProps } from "downshift";
import { StaticSelectFilterStore } from "../stores/StaticSelectFilterStore";
import { OptionWithState } from "../typings/BaseSelectStore";

export class AttrSelectAdapter {
    private filterStore: StaticSelectFilterStore;

    constructor(filterStore: StaticSelectFilterStore) {
        this.filterStore = filterStore;
    }

    get options(): OptionWithState[] {
        return this.filterStore.options;
    }

    triggerValue(): string {
        const selected = this.options.filter(option => option.selected);

        if (selected.length < 1) {
            return "Select item";
        }

        return selected.map(option => option.caption).join(", ");
    }

    getSelectProps(): UseSelectProps<OptionWithState> {
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
                    this.filterStore.setSelected([selectedItem.value]);
                }
            }
        };
    }
}
