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

    constructor({ filterStore }: { filterStore: StaticSelectFilterStore }) {
        this.filterStore = filterStore;
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
}
