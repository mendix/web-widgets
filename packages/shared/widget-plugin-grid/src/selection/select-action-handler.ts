import { SelectionHelper } from "./helpers";
import { SelectAdjacentFx, SelectAllFx, SelectFx, SelectionType, WidgetSelectionProperty } from "./types";

export class SelectActionHandler {
    constructor(private selection: WidgetSelectionProperty, private selectionHelper: SelectionHelper | undefined) {}

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

    onSelect: SelectFx = (item, shiftKey) => {
        if (!this.selectionHelper) {
            return;
        }

        if (this.selectionHelper.type === "Multi" && shiftKey) {
            this.selectionHelper.selectUpTo(item);
        } else if (this.selectionHelper.isSelected(item)) {
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

    onSelectAdjacent: SelectAdjacentFx = (item, shiftKey, direction, size) => {
        console.log(item, shiftKey, direction, size);
    };
}
