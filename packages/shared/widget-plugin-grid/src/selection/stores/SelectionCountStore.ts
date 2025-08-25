import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/props-gate";
import { DynamicValue, SelectionMultiValue, SelectionSingleValue } from "mendix";
import { computed, makeObservable } from "mobx";

type Gate = DerivedPropsGate<{
    itemSelection?: SelectionSingleValue | SelectionMultiValue;
    sCountFmtSingular?: DynamicValue<string>;
    sCountFmtPlural?: DynamicValue<string>;
}>;

export class SelectionCountStore {
    private gate: Gate;
    private singular: string = "%d row selected";
    private plural: string = "%d rows selected";

    constructor(gate: Gate, spec: { singular?: string; plural?: string } = {}) {
        this.singular = spec.singular ?? this.singular;
        this.plural = spec.plural ?? this.plural;
        this.gate = gate;

        makeObservable(this, {
            displayCount: computed,
            selectedCount: computed,
            fmtSingular: computed,
            fmtPlural: computed
        });
    }

    get fmtSingular(): string {
        return this.gate.props.sCountFmtSingular?.value || this.singular;
    }

    get fmtPlural(): string {
        return this.gate.props.sCountFmtPlural?.value || this.plural;
    }

    get selectedCount(): number {
        const { itemSelection } = this.gate.props;

        if (!itemSelection) {
            return 0;
        }

        // For single selection
        if (itemSelection.type === "Single") {
            return itemSelection.selection ? 1 : 0;
        }

        return itemSelection.selection?.length ?? 0;
    }

    get displayCount(): string {
        const count = this.selectedCount;
        if (count === 0) return "";
        if (count === 1) return this.fmtSingular.replace("%d", "1");
        return this.fmtPlural.replace("%d", `${count}`);
    }
}
