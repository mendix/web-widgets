import { ActionValue, EditableValue } from "mendix";
import { action, makeObservable } from "mobx";
import { disposeFx } from "../../mobx-utils";
import { RefFilterStore } from "../../stores/picker/RefFilterStore";
import { PickerBaseController } from "./PickerBaseController";

export class RefBaseController extends PickerBaseController<RefFilterStore> {
    constructor(props: RefBaseControllerProps) {
        super(props);
        makeObservable(this, {
            updateProps: action
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
}

export interface RefBaseControllerProps {
    defaultValue?: string;
    filterStore: RefFilterStore;
    multiselect: boolean;
    onChange?: ActionValue;
    valueAttribute?: EditableValue<string>;
    emptyCaption?: string;
    placeholder?: string;
}
