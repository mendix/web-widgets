import { ReferenceValue } from "mendix";
import { action, computed, makeObservable } from "mobx";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { BaseAssociationSelector, AssociationGateProps } from "./BaseAssociationSelector";
import { ComboboxConfig } from "../../core/Combobox.config";
import { ComboboxSetupHost } from "../../core/ComboboxSetup.service";
import { SingleSelector } from "../types";

export class AssociationSingleSelector extends BaseAssociationSelector<ReferenceValue> implements SingleSelector {
    readonly type = "single";

    constructor(host: ComboboxSetupHost, gate: DerivedPropsGate<AssociationGateProps>, config: ComboboxConfig) {
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
