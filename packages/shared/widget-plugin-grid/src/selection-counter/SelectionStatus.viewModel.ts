import { makeAutoObservable } from "mobx";

/**
 * ViewModel for SelectionStatus component that provides screen reader announcements
 * for selection state changes via ARIA live region.
 *
 * Only announces for bulk operations (select all, clear selection, keyboard shortcuts)
 * to avoid redundant "checked" + "X selected" announcements on individual checkbox clicks.
 * @injectable
 */
export class SelectionStatusViewModel {
    constructor(
        private selectionStatusStore: { selectionStatus: string; shouldAnnounce: boolean },
        private selectionType: "Single" | "Multi" | "None"
    ) {
        makeAutoObservable(this);
    }

    /**
     * Returns true if the status region should be visible and announce.
     * Only visible when selection is enabled (not "None") AND shouldAnnounce is true.
     */
    get isVisible(): boolean {
        return this.selectionType !== "None" && this.selectionStatusStore.shouldAnnounce;
    }

    /**
     * Returns the current selection status text.
     * Uses smart logic that handles "all items selected" vs partial selection.
     */
    get selectionStatus(): string {
        return this.selectionStatusStore.selectionStatus;
    }
}
