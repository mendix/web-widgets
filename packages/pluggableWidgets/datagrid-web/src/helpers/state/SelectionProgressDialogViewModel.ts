import { SelectAllController } from "@mendix/widget-plugin-grid/selection";
import { ProgressStore } from "@mendix/widget-plugin-grid/stores/ProgressStore";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/props-gate";
import { DynamicValue } from "mendix";
import { makeAutoObservable } from "mobx";

type Gate = DerivedPropsGate<{
    selectingAllLabel?: DynamicValue<string>;
    cancelSelectionLabel?: DynamicValue<string>;
}>;

export class SelectionProgressDialogViewModel {
    constructor(
        private gate: Gate,
        private progressStore: ProgressStore,
        private selectAllController: SelectAllController
    ) {
        makeAutoObservable(this);
    }

    get open(): boolean {
        return this.progressStore.inProgress;
    }

    get progress(): number {
        return this.progressStore.loaded;
    }

    get total(): number {
        return this.progressStore.total;
    }

    get selectingAllLabel(): string {
        return this.gate.props.selectingAllLabel?.value ?? "Selecting all items...";
    }

    get cancelSelectionLabel(): string {
        return this.gate.props.cancelSelectionLabel?.value ?? "Cancel selection";
    }

    onCancel(): void {
        this.selectAllController.abort();
    }
}
