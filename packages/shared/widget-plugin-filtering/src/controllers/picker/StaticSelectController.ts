import { UseSelectProps } from "downshift";
import { OptionWithState } from "../../typings/OptionWithState";
import { StaticBaseController, StaticBaseControllerProps } from "./StaticBaseController";

const none = "[[__none__]]" as const;

export class StaticSelectController extends StaticBaseController {
    readonly emptyOption = {
        value: none,
        caption: "None",
        selected: false
    };

    constructor(props: StaticBaseControllerProps) {
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

    useSelectProps = (): UseSelectProps<OptionWithState> => {
        return {
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
    };
}
