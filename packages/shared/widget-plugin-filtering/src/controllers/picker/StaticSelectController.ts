import { UseSelectProps } from "downshift";
import { ActionValue, DynamicValue, EditableValue } from "mendix";
import { autorun, makeObservable, observable } from "mobx";
import { disposeFx } from "../../mobx-utils";
import { OptionsSerializer } from "../../stores/picker/OptionsSerializer";
import { StaticSelectFilterStore } from "../../stores/picker/StaticSelectFilterStore";
import { IJSActionsControlled, ResetHandler, SetValueHandler } from "../../typings/IJSActionsControlled";
import { OptionWithState } from "../../typings/OptionWithState";
import { PickerChangeHelper } from "../generic/PickerChangeHelper";
import { PickerJSActionsHelper } from "../generic/PickerJSActionsHelper";

const none = "[[__none__]]" as const;

interface Props {
    defaultValue?: string;
    filterOptions: Array<CustomOption<DynamicValue<string>>>;
    filterStore: StaticSelectFilterStore;
    multiselect: boolean;
    onChange?: ActionValue;
    valueAttribute?: EditableValue<string>;
}

interface CustomOption<T> {
    caption: T;
    value: T;
}

export class StaticSelectController implements IJSActionsControlled {
    private actionHelper: PickerJSActionsHelper;
    private changeHelper: PickerChangeHelper;
    private defaultValue?: Iterable<string>;
    private filterStore: StaticSelectFilterStore;
    private serializer: OptionsSerializer;

    multiselect: boolean;
    filterOptions: Array<CustomOption<DynamicValue<string>>>;

    readonly emptyOption = {
        value: none,
        caption: "None",
        selected: false
    };

    constructor(props: Props) {
        this.filterOptions = props.filterOptions;
        this.filterStore = props.filterStore;
        this.multiselect = props.multiselect;
        this.serializer = new OptionsSerializer({ store: this.filterStore });
        this.defaultValue = this.serializer.fromStorableValue(props.defaultValue);
        this.actionHelper = new PickerJSActionsHelper({
            filterStore: props.filterStore,
            parse: value => this.serializer.fromStorableValue(value) ?? [],
            multiselect: props.multiselect
        });

        this.changeHelper = new PickerChangeHelper(props, () => this.serializer.value);

        makeObservable(this, { filterOptions: observable.struct });
    }

    setup(): () => void {
        const [disposers, dispose] = disposeFx();
        disposers.push(this.changeHelper.setup());

        disposers.push(
            autorun(() => {
                if (this.filterOptions.length > 0) {
                    const options = this.filterOptions.map(this.toStoreOption);
                    this.filterStore.setCustomOptions(options);
                }
            })
        );

        if (this.defaultValue) {
            this.filterStore.setDefaultSelected(this.defaultValue);
        }

        return dispose;
    }

    updateProps(props: Props): void {
        this.filterOptions = props.filterOptions;
        this.changeHelper.updateProps(props);
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

    toStoreOption = (opt: CustomOption<DynamicValue<string>>): CustomOption<string> => ({
        caption: `${opt.caption?.value}`,
        value: `${opt.value?.value}`
    });

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

    handleSetValue = (...args: Parameters<SetValueHandler>): void => {
        this.actionHelper.handleSetValue(...args);
    };

    handleResetValue = (...args: Parameters<ResetHandler>): void => {
        this.actionHelper.handleResetValue(...args);
    };
}
