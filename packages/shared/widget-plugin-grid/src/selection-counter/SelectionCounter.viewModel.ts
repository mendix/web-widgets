import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { DynamicValue, SelectionMultiValue, SelectionSingleValue } from "mendix";
import { makeAutoObservable } from "mobx";

interface DynamicProps {
    itemSelection?: SelectionSingleValue | SelectionMultiValue;
    selectedCountTemplateSingular?: DynamicValue<string>;
    selectedCountTemplatePlural?: DynamicValue<string>;
    clearSelectionButtonLabel?: DynamicValue<string>;
}

/** @injectable */
export class SelectionCounterViewModel {
    constructor(
        private readonly gate: DerivedPropsGate<DynamicProps>,
        private readonly position: "top" | "bottom" | "off"
    ) {
        makeAutoObservable(this);
    }

    private get props(): DynamicProps {
        return this.gate.props;
    }

    private get formatSingular(): string {
        return this.props.selectedCountTemplateSingular?.value || "%d row selected";
    }

    private get formatPlural(): string {
        return this.props.selectedCountTemplatePlural?.value || "%d rows selected";
    }

    get isTopCounterVisible(): boolean {
        if (this.position !== "top") return false;
        return this.selectedCount > 0;
    }

    get isBottomCounterVisible(): boolean {
        if (this.position !== "bottom") return false;
        return this.selectedCount > 0;
    }

    get clearButtonLabel(): string {
        return this.props.clearSelectionButtonLabel?.value || "Clear selection";
    }

    get selectedCount(): number {
        const { itemSelection } = this.props;

        if (!itemSelection) return 0;
        if (itemSelection.type === "Single") return 0;
        return itemSelection.selection.length;
    }

    get selectedCountText(): string {
        const count = this.selectedCount;
        if (count > 1) return this.formatPlural.replace("%d", `${count}`);
        if (count === 1) return this.formatSingular.replace("%d", "1");
        return "";
    }
}
