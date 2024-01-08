import { SelectionType } from "@mendix/widget-plugin-grid/selection";
import { ObjectItem } from "mendix";
import { ClickTrigger } from "../../helpers/ClickActionHelper";
import { SelectionMethod } from "../../helpers/SelectActionHelper";

export interface CellContext {
    item: ObjectItem;
    pageSize: number;
    selectionMethod: SelectionMethod;
    selectionType: SelectionType;
    clickTrigger: ClickTrigger;
}

export interface CheckboxContext {
    item: ObjectItem;
    selectionMethod: SelectionMethod;
}
