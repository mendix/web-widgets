import { UseSelectProps } from "downshift";
import { StaticSelectFilterStore } from "../stores/StaticSelectFilterStore";
import { OptionWithState } from "../typings/BaseSelectStore";

class AttrSelectAdapter {
    private filterStore: StaticSelectFilterStore;

    get options(): OptionWithState[] {
        return this.filterStore.options;
    }

    displayValue(): string {
        return "";
    }

    getSelectProps(): UseSelectProps<OptionWithState> {
        return {
            items: this.options,
            itemToString: item => item?.caption ?? "",
            onSelectedItemChange: ({ selectedItem }) => {
                if (selectedItem) {
                    this.filterStore.toggle(selectedItem.value);
                }
            }
        };
    }
}
