import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/props-gate";
import { DynamicValue, SelectionMultiValue, SelectionSingleValue } from "mendix";
import { computed, makeObservable } from "mobx";

type Gate = DerivedPropsGate<{
    itemSelection?: SelectionSingleValue | SelectionMultiValue;
    selectedCountTemplateSingular?: DynamicValue<string>;
    selectedCountTemplatePlural?: DynamicValue<string>;
    clearSelectionCaption?: DynamicValue<string>;
}>;

export class SelectionCountStore {
    private gate: Gate;
    private singular: string = "%d row selected.";
    private plural: string = "%d rows selected.";

    constructor(gate: Gate, spec: { singular?: string; plural?: string; clearLabel?: string } = {}) {
        this.singular = spec.singular ?? this.singular;
        this.plural = spec.plural ?? this.plural;
        this.defaultClearLabel = spec.clearLabel ?? this.defaultClearLabel;
        this.gate = gate;

        makeObservable(this, {
            selectedCountText: computed,
            selectedCount: computed,
            formatSingular: computed,
            formatPlural: computed
        });
    }

    get formatSingular(): string {
        return this.gate.props.selectedCountTemplateSingular?.value || this.singular;
    }

    get formatPlural(): string {
        return this.gate.props.selectedCountTemplatePlural?.value || this.plural;
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

    get selectedCountText(): string {
        const count = this.selectedCount;
        if (count === 0) return "";
        if (count === 1) return this.formatSingular.replace("%d", "1");
        return this.formatPlural.replace("%d", `${count}`);
    }

    get clearSelectionLabel(): string {
        return this.gate.props.clearSelectionCaption?.value ?? "clear.selection.caption";
    }
}
