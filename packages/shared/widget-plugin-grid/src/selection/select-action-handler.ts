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

    private _onSelectItemMulti: SelectFx = (item, shiftKey, toggle) => {
        if (this.selectionHelper?.type !== "Multi") {
            return;
        }

        if (shiftKey) {
            this.selectionHelper.selectUpTo(item);
            return;
        }

        if (this.selectionHelper.isSelected(item)) {
            this.selectionHelper.remove(item);
        } else if (toggle) {
            this.selectionHelper.add(item);
        } else {
            this.selectionHelper.reduceTo(item);
        }
    };

    _onSelectItemSingle: SelectFx = item => {
        if (this.selectionHelper?.type !== "Single") {
            return;
        }

        if (this.selectionHelper.isSelected(item)) {
            this.selectionHelper.remove(item);
        } else {
            this.selectionHelper.add(item);
        }
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
}
