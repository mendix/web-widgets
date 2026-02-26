import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { ActionValue, EditableValue } from "mendix";
import { OptionsSerializer } from "../stores/OptionsSerializer";
import { IJSActionsControlled, ResetHandler, SetValueHandler } from "../typings/IJSActionsControlled";
import { OptionWithState } from "../typings/OptionWithState";
import { JSActionsHelper } from "./JSActionsHelper";
import { ValueChangeHelper } from "./ValueChangeHelper";

interface FilterStore {
    reset: () => void;
    clear: () => void;
    setSelected: (value: Iterable<string>) => void;
    selected: Set<string>;
    options: OptionWithState[];
}

export interface BaseControllerProps<S extends FilterStore> {
    defaultValue?: string;
    filterStore: S;
    multiselect: boolean;
    onChange?: ActionValue;
    valueAttribute?: EditableValue<string>;
    emptySelectionCaption: string;
    emptyOptionCaption: string;
    ariaLabel: string;
    placeholder: string;
}

type Gate<S extends FilterStore> = DerivedPropsGate<BaseControllerProps<S>>;

export class BaseController<S extends FilterStore> implements IJSActionsControlled {
    protected readonly gate: Gate<S>;
    protected actionHelper: JSActionsHelper;
    protected changeHelper: ValueChangeHelper;
    protected defaultValue?: Iterable<string>;
    protected serializer: OptionsSerializer;
    filterStore: S;
    multiselect: boolean;

    constructor({ gate, multiselect }: { gate: Gate<S>; multiselect: boolean }) {
        const props = gate.props;
        this.gate = gate;
        this.filterStore = props.filterStore;
        this.multiselect = multiselect;
        this.serializer = new OptionsSerializer({ store: this.filterStore });
        this.defaultValue = this.parseDefaultValue(props.defaultValue);
        this.actionHelper = new JSActionsHelper({
            filterStore: props.filterStore,
            parse: value => this.serializer.fromStorableValue(value) ?? [],
            multiselect: props.multiselect
        });
        this.changeHelper = new ValueChangeHelper(gate, () => this.serializer.value);
    }

    get emptyCaption(): string {
        return this.gate.props.emptySelectionCaption;
    }

    get ariaLabel(): string {
        return this.gate.props.ariaLabel;
    }

    get emptyOptionCaption(): string {
        return this.gate.props.emptyOptionCaption;
    }

    get inputPlaceholder(): string {
        return this.gate.props.placeholder;
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
