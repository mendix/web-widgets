import { ActionValue, EditableValue } from "mendix";
import { action, makeObservable, observable } from "mobx";
import { disposeFx } from "../../mobx-utils";
import { OptionsSerializer } from "../../stores/picker/OptionsSerializer";
import { RefFilterStore } from "../../stores/picker/RefFilterStore";
import { IJSActionsControlled, ResetHandler, SetValueHandler } from "../../typings/IJSActionsControlled";
import { OptionWithState } from "../../typings/OptionWithState";
import { PickerChangeHelper } from "../generic/PickerChangeHelper";
import { PickerJSActionsHelper } from "../generic/PickerJSActionsHelper";

export class RefBaseController implements IJSActionsControlled {
    protected actionHelper: PickerJSActionsHelper;
    protected changeHelper: PickerChangeHelper;
    protected defaultValue?: Iterable<string>;
    protected filterStore: RefFilterStore;
    protected serializer: OptionsSerializer;
    protected touched = false;
    multiselect: boolean;

    constructor(props: RefBaseControllerProps) {
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

        makeObservable<this, "touched" | "setTouched">(this, {
            updateProps: action,
            touched: observable,
            setTouched: action
        });
    }

    setup(): () => void {
        const [disposers, dispose] = disposeFx();

        disposers.push(this.changeHelper.setup());

        if (this.defaultValue) {
            this.filterStore.setDefaultSelected(this.defaultValue);
        }

        return dispose;
    }

    updateProps(props: RefBaseControllerProps): void {
        this.changeHelper.updateProps(props);
    }

    protected setTouched(touched: boolean): void {
        this.filterStore.setTouched(touched);
    }

    protected parseDefaultValue = (value: string | undefined): Iterable<string> | undefined => {
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

export interface RefBaseControllerProps {
    defaultValue?: string;
    filterStore: RefFilterStore;
    multiselect: boolean;
    onChange?: ActionValue;
    valueAttribute?: EditableValue<string>;
    emptyCaption?: string;
}
