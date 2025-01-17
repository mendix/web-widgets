import { ActionValue, DynamicValue, EditableValue } from "mendix";
import { action, autorun, makeObservable, observable } from "mobx";
import { disposeFx } from "../../mobx-utils";
import { OptionsSerializer } from "../../stores/picker/OptionsSerializer";
import { StaticSelectFilterStore } from "../../stores/picker/StaticSelectFilterStore";
import { IJSActionsControlled, ResetHandler, SetValueHandler } from "../../typings/IJSActionsControlled";
import { OptionWithState } from "../../typings/OptionWithState";
import { PickerChangeHelper } from "../generic/PickerChangeHelper";
import { PickerJSActionsHelper } from "../generic/PickerJSActionsHelper";

export class StaticBaseController implements IJSActionsControlled {
    protected actionHelper: PickerJSActionsHelper;
    protected changeHelper: PickerChangeHelper;
    protected defaultValue?: Iterable<string>;
    protected filterStore: StaticSelectFilterStore;
    protected serializer: OptionsSerializer;
    protected filterOptions: Array<CustomOption<DynamicValue<string>>>;
    protected multiselect: boolean;

    constructor(props: StaticBaseControllerProps) {
        this.filterOptions = props.filterOptions;
        this.filterStore = props.filterStore;
        this.multiselect = props.multiselect;
        this.serializer = new OptionsSerializer({ store: this.filterStore });
        this.defaultValue = this.parseDefaultValue(props.defaultValue);
        this.actionHelper = new PickerJSActionsHelper({
            filterStore: props.filterStore,
            parse: value => this.serializer.fromStorableValue(value) ?? [],
            multiselect: props.multiselect
        });

        this.changeHelper = new PickerChangeHelper(props, () => this.serializer.value);

        makeObservable<this, "filterOptions">(this, { filterOptions: observable.struct, updateProps: action });
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

    updateProps(props: StaticBaseControllerProps): void {
        this.filterOptions = props.filterOptions;
        this.changeHelper.updateProps(props);
    }

    toStoreOption = (opt: CustomOption<DynamicValue<string>>): CustomOption<string> => ({
        caption: `${opt.caption?.value}`,
        value: `${opt.value?.value}`
    });

    parseDefaultValue = (value: string | undefined): Iterable<string> | undefined => {
        const defaultValue = this.serializer.fromStorableValue(value);
        if (!defaultValue) {
            return undefined;
        }
        const arr = Array.from(defaultValue);
        return this.multiselect ? arr : arr.slice(0, 1);
    };

    get options(): OptionWithState[] {
        return this.filterStore.options;
    }

    get isEmpty(): boolean {
        return this.filterStore.selected.size === 0;
    }

    handleSetValue = (...args: Parameters<SetValueHandler>): void => {
        this.actionHelper.handleSetValue(...args);
    };

    handleResetValue = (...args: Parameters<ResetHandler>): void => {
        this.actionHelper.handleResetValue(...args);
    };
}

export interface StaticBaseControllerProps {
    defaultValue?: string;
    filterOptions: Array<CustomOption<DynamicValue<string>>>;
    filterStore: StaticSelectFilterStore;
    multiselect: boolean;
    onChange?: ActionValue;
    valueAttribute?: EditableValue<string>;
    emptyCaption?: string;
}

export interface CustomOption<T> {
    caption: T;
    value: T;
}
