import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/props-gate";
import { DynamicValue, SelectionMultiValue, SelectionSingleValue } from "mendix";
import { computed, makeObservable } from "mobx";

type Gate = DerivedPropsGate<{
    itemSelection?: SelectionSingleValue | SelectionMultiValue;
    selectedCountTemplateSingular?: DynamicValue<string>;
    selectedCountTemplatePlural?: DynamicValue<string>;
    clearSelectionButtonLabel?: DynamicValue<string>;
}>;

export class SelectionCountStore {
    private singular: string = "%d row selected";
    private plural: string = "%d rows selected";
    private defaultClearLabel: string = "Clear selection";

    constructor(private readonly gate: Gate) {
        makeObservable(this, {
            displayCount: computed,
            selectedCount: computed,
            fmtSingular: computed,
            fmtPlural: computed,
            clearButtonLabel: computed
        });
    }

    get clearButtonLabel(): string {
        return this.gate.props.clearSelectionButtonLabel?.value || this.defaultClearLabel;
    }

    get fmtSingular(): string {
        return this.gate.props.selectedCountTemplateSingular?.value || this.singular;
    }

    get fmtPlural(): string {
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

    get displayCount(): string {
        const count = this.selectedCount;
        if (count === 0) return "";
        if (count === 1) return this.fmtSingular.replace("%d", "1");
        return this.fmtPlural.replace("%d", `${count}`);
    }
}
