import { ObjectItem } from "mendix";
import { SelectionHelper } from "./helpers";
import { SelectAdjacentFx, SelectAllFx, SelectFx, SelectionType, WidgetSelectionProperty } from "./types";

export class SelectActionHandler {
    constructor(private selection: WidgetSelectionProperty, protected selectionHelper: SelectionHelper | undefined) {}

    get selectionType(): SelectionType {
        if (this.selection === undefined) {
            return "None";
        }

        if (typeof this.selection === "object") {
            return this.selection.type;
        }

        if (this.selection === "None" || this.selection === "Single" || this.selection === "Multi") {
            return this.selection;
        }

        throw new Error(`Unknown selection type: ${this.selection}`);
    }

    onSelect: SelectFx = (...params) => {
        if (!this.selectionHelper) {
            return;
        }

        if (this.selectionHelper.type === "Multi") {
            this._onSelectItemMulti(...params);
        } else {
            this._onSelectItemSingle(...params);
        }
    };

    private _onSelectItemMulti: SelectFx = (item, shiftKey, toggleMode = false) => {
        if (this.selectionHelper?.type !== "Multi") {
            return;
        }

        if (shiftKey) {
            this.selectionHelper.selectUpTo(item, toggleMode ? "toggle" : "clear");
            return;
        }

        this.selectItem(item, toggleMode);
    };

    _onSelectItemSingle: SelectFx = (item, _, toggleMode = false) => {
        this.selectItem(item, toggleMode);
    };

    onSelectAll: SelectAllFx = (requestedAction?: "selectAll") => {
        if (!this.selectionHelper) {
            return;
        }

        if (this.selectionHelper.type === "Single") {
            console.warn("Datagrid: calling onSelectAll in single selection mode have no effect");
            return;
        }

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

    onSelectAdjacent: SelectAdjacentFx = (...params) => {
        if (this.selectionHelper?.type === "Multi") {
            this.selectionHelper.selectUpToAdjacent(...params);
        }
    };

    isSelected = (item: ObjectItem): boolean => {
        return this.selectionHelper ? this.selectionHelper.isSelected(item) : false;
    };

    private selectItem = (item: ObjectItem, toggleMode: boolean): void => {
        if (this.selectionHelper === undefined) {
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
