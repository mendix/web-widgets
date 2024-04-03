import { SelectionMode, SelectionType } from "@mendix/widget-plugin-grid/selection";
import { ObjectItem } from "mendix";
import { ClickTrigger } from "@mendix/widget-plugin-grid/helpers/ClickActionHelper";
import { SelectionMethod } from "../../helpers/SelectActionHelper";

interface BaseContext {
    item: ObjectItem;
    pageSize: number;
    selectionMethod: SelectionMethod;
    selectionType: SelectionType;
    selectionMode: SelectionMode;
}

export interface CellContext extends BaseContext {
    clickTrigger: ClickTrigger;
}

export interface CheckboxContext extends BaseContext {}
