import { SelectionType } from "@mendix/widget-plugin-grid/selection";
import { ObjectItem } from "mendix";
import { ClickTrigger } from "../../helpers/ClickActionHelper";
import { SelectionMethod } from "../../helpers/SelectActionHelper";

interface BaseContext {
    item: ObjectItem;
    pageSize: number;
    selectionMethod: SelectionMethod;
    selectionType: SelectionType;
}

export interface CellContext extends BaseContext {
    clickTrigger: ClickTrigger;
}

export interface CheckboxContext extends BaseContext {}
