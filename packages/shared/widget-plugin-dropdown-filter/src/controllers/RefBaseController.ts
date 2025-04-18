import { disposeBatch } from "@mendix/widget-plugin-mobx-kit/disposeBatch";
import { ActionValue, EditableValue } from "mendix";
import { action, makeObservable } from "mobx";
import { RefFilterStore } from "../stores/RefFilterStore";
import { PickerBaseController } from "./PickerBaseController";

export class RefBaseController extends PickerBaseController<RefFilterStore> {
    constructor(props: RefBaseControllerProps) {
        super(props);
        makeObservable(this, {
            updateProps: action
        });
    }

    setup(): () => void {
        const [add, disposeAll] = disposeBatch();

        add(this.changeHelper.setup());

        if (this.defaultValue) {
            this.filterStore.setDefaultSelected(this.defaultValue);
        }

        return disposeAll;
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
