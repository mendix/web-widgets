import { ActionValue, EditableValue } from "mendix";
import { OptionsSerializer } from "../../stores/picker/OptionsSerializer";
import { IJSActionsControlled, ResetHandler, SetValueHandler } from "../../typings/IJSActionsControlled";
import { OptionWithState } from "../../typings/OptionWithState";
import { PickerChangeHelper } from "../generic/PickerChangeHelper";
import { PickerJSActionsHelper } from "../generic/PickerJSActionsHelper";

interface FilterStore {
    reset: () => void;
    clear: () => void;
    setSelected: (value: Iterable<string>) => void;
    selected: Set<string>;
    options: OptionWithState[];
}

export class PickerBaseController<S extends FilterStore> implements IJSActionsControlled {
    protected actionHelper: PickerJSActionsHelper;
    protected changeHelper: PickerChangeHelper;
    protected defaultValue?: Iterable<string>;
    protected serializer: OptionsSerializer;
    filterStore: S;
    multiselect: boolean;

    constructor(props: PickerBaseControllerProps<S>) {
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
    }

    parseDefaultValue = (value: string | undefined): Iterable<string> | undefined => {
        const defaultValue = this.serializer.fromStorableValue(value);
        if (!defaultValue) {
            return undefined;
        }
        const arr = Array.from(defaultValue);
        return this.multiselect ? arr : arr.slice(0, 1);
    };

    handleSetValue = (...args: Parameters<SetValueHandler>): void => {
        this.actionHelper.handleSetValue(...args);
    };

    handleResetValue = (...args: Parameters<ResetHandler>): void => {
        this.actionHelper.handleResetValue(...args);
    };
}

export interface PickerBaseControllerProps<S extends FilterStore> {
    defaultValue?: string;
    filterStore: S;
    multiselect: boolean;
    onChange?: ActionValue;
    valueAttribute?: EditableValue<string>;
    emptyCaption?: string;
}
