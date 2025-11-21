import { ClickTrigger } from "@mendix/widget-plugin-grid/helpers/ClickActionHelper";
import { SelectionMode, SelectionType } from "@mendix/widget-plugin-grid/selection";
import { ObjectItem } from "mendix";

export type SelectionMethod = "rowClick" | "checkbox" | "none";

interface BaseEventContext {
    item: ObjectItem;
    pageSize: number;
    selectionMethod: SelectionMethod;
    selectionType: SelectionType;
    selectionMode: SelectionMode;
}

export interface CellContext extends BaseEventContext {
    type: "cell";
    clickTrigger: ClickTrigger;
}

export interface CheckboxContext extends BaseEventContext {
    type: "checkbox";
}
