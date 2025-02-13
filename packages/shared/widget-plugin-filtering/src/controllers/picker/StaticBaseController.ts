import { ActionValue, DynamicValue, EditableValue } from "mendix";
import { action, autorun, makeObservable, observable } from "mobx";
import { disposeFx } from "../../mobx-utils";
import { StaticSelectFilterStore } from "../../stores/picker/StaticSelectFilterStore";
import { PickerBaseController } from "./PickerBaseController";

export class StaticBaseController extends PickerBaseController<StaticSelectFilterStore> {
    filterOptions: Array<CustomOption<DynamicValue<string>>>;

    constructor(props: StaticBaseControllerProps) {
        super(props);
        this.filterOptions = props.filterOptions;
        makeObservable(this, {
            updateProps: action,
            filterOptions: observable.struct
        });
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
}

export interface StaticBaseControllerProps {
    defaultValue?: string;
    filterOptions: Array<CustomOption<DynamicValue<string>>>;
    filterStore: StaticSelectFilterStore;
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
