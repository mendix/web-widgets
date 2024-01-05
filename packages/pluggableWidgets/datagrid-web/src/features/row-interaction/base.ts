import { SelectionType } from "@mendix/widget-plugin-grid/selection";
import { ObjectItem } from "mendix";

export type SelectionMethod = "rowClick" | "checkbox" | "none";

export type ClickTrigger = "single" | "double" | "none";

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
