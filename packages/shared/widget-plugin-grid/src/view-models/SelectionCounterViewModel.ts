import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/props-gate";
import { DynamicValue, SelectionMultiValue, SelectionSingleValue } from "mendix";
import { makeAutoObservable } from "mobx";

interface DynamicProps {
    itemSelection?: SelectionSingleValue | SelectionMultiValue;
    selectedCountTemplateSingular?: DynamicValue<string>;
    selectedCountTemplatePlural?: DynamicValue<string>;
    clearSelectionCaption?: DynamicValue<string>;
}

interface StaticProps {
    selectionCountPosition: "top" | "bottom" | "off";
}

export type Props = DynamicProps & StaticProps;

export class SelectionCounterViewModel {
    private readonly position: "top" | "bottom" | "off";

    constructor(private gate: DerivedPropsGate<DynamicProps & StaticProps>) {
        makeAutoObservable(this);
        this.position = gate.props.selectionCountPosition;
    }

    get formatSingular(): string {
        return this.gate.props.selectedCountTemplateSingular?.value || "%d.row.count";
    }

    get formatPlural(): string {
        return this.gate.props.selectedCountTemplatePlural?.value || "%d.rows.count";
    }

    get selectedCount(): number {
        const { itemSelection } = this.gate.props;

        if (itemSelection === undefined) return 0;
        if (itemSelection.type === "Single") return 0;
        return itemSelection.selection.length;
    }

    get selectedCountText(): string {
        if (this.selectedCount === 0) return "";
        if (this.selectedCount === 1) return this.formatSingular.replace("%d", "1");
        return this.formatPlural.replace("%d", `${this.selectedCount}`);
    }

    get clearSelectionText(): string {
        return this.gate.props.clearSelectionCaption?.value ?? "clear.selection.caption";
    }

    get isTopCounterVisible(): boolean {
        return this.position === "top" && this.selectedCount > 0;
    }

    get isBottomCounterVisible(): boolean {
        return this.position === "bottom" && this.selectedCount > 0;
    }
}
