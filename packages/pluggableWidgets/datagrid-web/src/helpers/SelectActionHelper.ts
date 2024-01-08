import { SelectActionHandler, SelectionHelper, WidgetSelectionProperty } from "@mendix/widget-plugin-grid/selection";
import { ItemSelectionMethodEnum } from "../../typings/DatagridProps";
export type SelectionMethod = "rowClick" | "checkbox" | "none";

export class SelectActionHelper extends SelectActionHandler {
    pageSize: number;
    private _selectionMethod: ItemSelectionMethodEnum;
    private _showSelectAllToggle: boolean;

    constructor(
        selection: WidgetSelectionProperty,
        selectionHelper: SelectionHelper | undefined,
        _selectionMethod: ItemSelectionMethodEnum,
        _showSelectAllToggle: boolean,
        pageSize: number
    ) {
        super(selection, selectionHelper);
        this._selectionMethod = _selectionMethod;
        this._showSelectAllToggle = _showSelectAllToggle;
        this.pageSize = pageSize;
    }

    get selectionMethod(): SelectionMethod {
        return this.selectionType === "None" ? "none" : this._selectionMethod;
    }

    get showCheckboxColumn(): boolean {
        return this.selectionMethod === "checkbox";
    }

    get showSelectAllToggle(): boolean {
        return this._showSelectAllToggle;
    }
}
