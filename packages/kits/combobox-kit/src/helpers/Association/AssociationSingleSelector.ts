import { ReferenceValue } from "mendix";
import { action, computed, makeObservable } from "mobx";
import { DerivedPropsGate, SetupComponentHost } from "@mendix/widget-plugin-mobx-kit/main";
import { ComboboxConfig } from "../../core/Combobox.config";
import { SingleSelector } from "../types";
import { BaseAssociationSelector, AssociationGateProps } from "./BaseAssociationSelector";

export class AssociationSingleSelector extends BaseAssociationSelector<ReferenceValue> implements SingleSelector {
    readonly type = "single";

    constructor(host: SetupComponentHost, gate: DerivedPropsGate<AssociationGateProps>, config: ComboboxConfig) {
        super(host, gate, config);
        makeObservable(this, { currentId: computed, setValue: action });
    }

    /** Mirrors the reference even while unavailable; nothing renders in that status. */
    get currentId(): string | null {
        return this.attr.value?.id ?? null;
    }

    setValue(id: string | null): void {
        this.attr.setValue(this.options.item(id));
    }
}
