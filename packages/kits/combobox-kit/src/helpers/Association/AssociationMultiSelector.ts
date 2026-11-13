import { ReferenceSetValue } from "mendix";
import { action, computed, makeObservable } from "mobx";
import { ThreeStateCheckBoxEnum } from "@mendix/widget-plugin-component-kit/ThreeStateCheckBox";
import { DerivedPropsGate, SetupComponentHost } from "@mendix/widget-plugin-mobx-kit/main";
import { ComboboxConfig } from "../../core/Combobox.config";
import { menuOptions, selectAllState } from "../multiSelection";
import { MultiSelector } from "../types";
import { sortSelectedItems } from "../utils";
import { BaseAssociationSelector, AssociationGateProps } from "./BaseAssociationSelector";

export class AssociationMultiSelector extends BaseAssociationSelector<ReferenceSetValue> implements MultiSelector {
    readonly type = "multi";

    constructor(host: SetupComponentHost, gate: DerivedPropsGate<AssociationGateProps>, config: ComboboxConfig) {
        super(host, gate, config);
        makeObservable(this, { currentId: computed, setValue: action });
    }

    /** The selected ids in reference order, or sorted by caption when configured. */
    get currentId(): string[] | null {
        return sortSelectedItems(this.attr.value, this.config.selectedItemsSorting, this.options.sortOrder, id =>
            this.caption.get(id)
        );
    }

    setValue(ids: string[] | null): void {
        this.attr.setValue(ids?.map(id => this.options.item(id)!));
    }

    getOptions(): string[] {
        return menuOptions(this.options.getAll(), this.currentId, this.config.selectionMethod);
    }

    isOptionsSelected(): ThreeStateCheckBoxEnum {
        return selectAllState(this.options.getAll(), this.currentId);
    }
}
