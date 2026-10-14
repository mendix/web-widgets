import { ActionValue, EditableValue } from "mendix";
import { disposeBatch } from "@mendix/widget-plugin-mobx-kit/disposeBatch";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { BaseController } from "./BaseController";
import { RefFilterStore } from "../stores/RefFilterStore";

export class RefBaseController extends BaseController<RefFilterStore> {
    constructor({ gate, multiselect }: { gate: DerivedPropsGate<RefBaseControllerProps>; multiselect: boolean }) {
        super({ gate, multiselect });
    }

    setup(): () => void {
        const [add, disposeAll] = disposeBatch();

        add(this.changeHelper.setup());

        if (this.defaultValue) {
            this.filterStore.setDefaultSelected(this.defaultValue);
        }

        return disposeAll;
    }
}

export interface RefBaseControllerProps {
    defaultValue?: string;
    filterStore: RefFilterStore;
    multiselect: boolean;
    onChange?: ActionValue;
    valueAttribute?: EditableValue<string>;
    emptyOptionCaption: string;
    emptySelectionCaption: string;
    placeholder: string;
    ariaLabel: string;
}
