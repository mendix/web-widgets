import { SelectAllEvents } from "@mendix/widget-plugin-grid/select-all/select-all.model";
import { Emitter } from "@mendix/widget-plugin-mobx-kit/main";
import { makeAutoObservable } from "mobx";

/** @injectable */
export class SelectAllBarViewModel {
    constructor(
        private emitter: Emitter<SelectAllEvents>,
        private state: { pending: boolean; visible: boolean; clearBtnVisible: boolean },
        private selectionTexts: {
            clearSelectionButtonLabel: string;
            selectedCountText: string;
        },
        private selectAllTexts: {
            selectAllLabel: string;
            selectionStatus: string;
        },
        private enableSelectAll: boolean
    ) {
        makeAutoObservable(this);
    }

    get selectAllLabel(): string {
        return this.selectAllTexts.selectAllLabel;
    }

    get clearSelectionLabel(): string {
        return this.selectionTexts.clearSelectionButtonLabel;
    }

    get selectionStatus(): string {
        return this.selectAllTexts.selectionStatus;
    }

    get isBarVisible(): boolean {
        return this.enableSelectAll && this.state.visible;
    }

    get isClearVisible(): boolean {
        return this.state.clearBtnVisible;
    }

    get isSelectAllDisabled(): boolean {
        return this.state.pending;
    }

    onClear(): void {
        this.emitter.emit("clear");
    }

    onSelectAll(): void {
        this.emitter.emit("startSelecting");
    }
}
