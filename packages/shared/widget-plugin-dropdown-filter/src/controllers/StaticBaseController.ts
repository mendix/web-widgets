import { disposeBatch } from "@mendix/widget-plugin-mobx-kit/disposeBatch";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/props-gate";
import { ActionValue, DynamicValue, EditableValue } from "mendix";
import { autorun, computed, makeObservable } from "mobx";
import { EnumFilterStore } from "../stores/EnumFilterStore";
import { PickerBaseController } from "./PickerBaseController";

export class StaticBaseController extends PickerBaseController<EnumFilterStore> {
    private readonly gate: DerivedPropsGate<StaticBaseControllerProps>;

    constructor({ gate, multiselect }: { gate: DerivedPropsGate<StaticBaseControllerProps>; multiselect: boolean }) {
        super({ gate, multiselect });
        this.gate = gate;
        makeObservable<this, "filterOptions">(this, {
            filterOptions: computed.struct
        });
    }

    private get filterOptions(): Array<CustomOption<string>> {
        return this.gate.props.filterOptions.map(this.toStoreOption);
    }

    setup(): () => void {
        const [addDisposer, dispose] = disposeBatch();

        addDisposer(this.changeHelper.setup());

        addDisposer(
            autorun(() => {
                if (this.filterOptions.length > 0) {
                    this.filterStore.setCustomOptions(this.filterOptions);
                }
            })
        );

        if (this.defaultValue) {
            this.filterStore.setDefaultSelected(this.defaultValue);
        }

        return dispose;
    }

    toStoreOption = (opt: CustomOption<DynamicValue<string>>): CustomOption<string> => ({
        caption: `${opt.caption?.value}`,
        value: `${opt.value?.value}`
    });
}

export interface StaticBaseControllerProps {
    defaultValue?: string;
    filterOptions: Array<CustomOption<DynamicValue<string>>>;
    filterStore: EnumFilterStore;
    multiselect: boolean;
    onChange?: ActionValue;
    valueAttribute?: EditableValue<string>;
    emptyCaption?: string;
    placeholder?: string;
}

export interface CustomOption<T> {
    caption: T;
    value: T;
}
