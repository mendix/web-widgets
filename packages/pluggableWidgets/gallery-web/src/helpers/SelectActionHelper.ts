import { SelectActionHandler, SelectAdjacentInGridFx } from "@mendix/widget-plugin-grid/selection";

export class SelectActionHelper extends SelectActionHandler {
    onSelectAdjacentGrid: SelectAdjacentInGridFx = (...params) => {
        if (this.selectionHelper?.type === "Multi") {
            this.selectionHelper.selectUpToAdjacent(...params);
        }
    };
}
