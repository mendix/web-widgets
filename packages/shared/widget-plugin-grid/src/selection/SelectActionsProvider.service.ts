import { ObjectItem } from "mendix";
import { SelectActionsService } from "../interfaces/SelectActionsService";
import { SelectionHelperService } from "../interfaces/SelectionHelperService";
import { SelectAdjacentFx, SelectAllFx, SelectFx, SelectionType } from "./types";

export class SelectActionsProvider implements SelectActionsService {
    constructor(
        private type: SelectionType,
        private selectionHelper: SelectionHelperService,
        private selectionStatusStore?: { setShouldAnnounce(value: boolean): void }
    ) {
        if (type === "Multi") {
            if (!selectionHelper || selectionHelper.type !== "Multi") {
                throw new Error("SelectionHelperService of type Multi is required for Multi selection type");
            }
        }
        if (type === "Single") {
            if (!selectionHelper || selectionHelper.type !== "Single") {
                throw new Error("SelectionHelperService of type Single is required for Single selection type");
            }
        }
    }

    get selectionType(): SelectionType {
        return this.type;
    }

    select: SelectFx = (...params) => {
        if (!this.selectionHelper) {
            return;
        }

        if (this.selectionHelper.type === "Multi") {
            this.selectItemMulti(...params);
        } else {
            this.selectItemSingle(...params);
        }
    };

    selectPage: SelectAllFx = (requestedAction?: "selectAll") => {
        if (!this.selectionHelper) {
            return;
        }

        if (this.selectionHelper.type === "Single") {
            console.warn("Calling selectPage in single selection mode have no effect");
            return;
        }

        // Enable announcements for bulk operations (select all / keyboard shortcuts)
        this.selectionStatusStore?.setShouldAnnounce(true);

        if (requestedAction === "selectAll") {
            this.selectionHelper.selectAll();
            return;
        }

        if (this.selectionHelper.selectionStatus === "all") {
            this.selectionHelper.selectNone();
        } else {
            this.selectionHelper.selectAll();
        }
    };

    selectAdjacent: SelectAdjacentFx = (...params) => {
        if (this.selectionHelper?.type === "Multi") {
            this.selectionHelper.selectUpToAdjacent(...params);
        }
    };

    isSelected = (item: ObjectItem): boolean => {
        return this.selectionHelper ? this.selectionHelper.isSelected(item) : false;
    };

    clearSelection = (): void => {
        // Enable announcements for bulk clear operation
        this.selectionStatusStore?.setShouldAnnounce(true);

        if (this.selectionHelper?.type === "Multi") {
            this.selectionHelper.clearSelection();
        } else if (this.selectionHelper?.type === "Single") {
            this.selectionHelper.remove();
        }
    };

    private selectItemMulti: SelectFx = (item, shiftKey, toggleMode = false) => {
        if (this.selectionHelper?.type !== "Multi") {
            return;
        }

        if (shiftKey) {
            // Shift+click selects range - treat as bulk operation
            this.selectionStatusStore?.setShouldAnnounce(true);
            this.selectionHelper.selectUpTo(item, toggleMode ? "toggle" : "clear");
            return;
        }

        // Disable announcements for individual checkbox clicks
        this.selectionStatusStore?.setShouldAnnounce(false);
        this.selectItem(item, toggleMode);
    };

    private selectItemSingle: SelectFx = (item, _, toggleMode = false) => {
        // Disable announcements for individual row selection
        this.selectionStatusStore?.setShouldAnnounce(false);
        this.selectItem(item, toggleMode);
    };

    private selectItem = (item: ObjectItem, toggleMode: boolean): void => {
        if (this.selectionHelper == null) {
            return;
        }

        // clear mode
        if (toggleMode === false) {
            this.selectionHelper.reduceTo(item);
            return;
        }

        // toggle mode
        if (this.selectionHelper.isSelected(item)) {
            this.selectionHelper.remove(item);
        } else if (this.selectionHelper.type === "Multi") {
            this.selectionHelper.add(item);
        } else {
            this.selectionHelper.reduceTo(item);
        }
    };
}
