import { ComputedAtom } from "@mendix/widget-plugin-mobx-kit/main";
import { makeAutoObservable } from "mobx";

/** @injectable */
export class SelectionCounterViewModel {
    constructor(
        private selected: ComputedAtom<number>,
        private texts: {
            clearSelectionButtonLabel: string;
            selectedCountText: string;
        },
        private position: "top" | "bottom" | "off"
    ) {
        makeAutoObservable(this);
    }

    get isTopCounterVisible(): boolean {
        if (this.position !== "top") return false;
        return this.selected.get() > 0;
    }

    get isBottomCounterVisible(): boolean {
        if (this.position !== "bottom") return false;
        return this.selected.get() > 0;
    }

    get clearButtonLabel(): string {
        return this.texts.clearSelectionButtonLabel;
    }

    get selectedCount(): number {
        return this.selected.get();
    }

    get selectedCountText(): string {
        return this.texts.selectedCountText;
    }
}
