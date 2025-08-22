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

    constructor(gate: Gate) {
        this.gate = gate;

        makeObservable(this, {
            displayCount: computed,
            selectedCount: computed,
            fmtSingular: computed,
            fmtPlural: computed
        });
    }

    get fmtSingular(): string {
        return this.gate.props.sCountFmtSingular?.value || "%d row selected";
    }

    get fmtPlural(): string {
        return this.gate.props.sCountFmtPlural?.value || "%d rows selected";
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
