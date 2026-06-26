import { ComputedAtom } from "@mendix/widget-plugin-mobx-kit/main";
import { makeAutoObservable } from "mobx";

/**
 * ViewModel for SelectionStatus component that provides screen reader announcements
 * for selection state changes via ARIA live region.
 * @injectable
 */
export class SelectionStatusViewModel {
    constructor(
        private selectionStatusStore: { selectionStatus: string },
        private selectionType: "Single" | "Multi" | "None"
    ) {
        makeAutoObservable(this);
    }

    /**
     * Returns true if the status region should be visible.
     * Only visible when selection is enabled (not "None").
     */
    get isVisible(): boolean {
        return this.selectionType !== "None";
    }

    /**
     * Returns the current selection status text.
     * Uses smart logic that handles "all items selected" vs partial selection.
     */
    get selectionStatus(): string {
        return this.selectionStatusStore.selectionStatus;
    }
}
