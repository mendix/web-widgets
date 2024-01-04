import { SelectionType } from "@mendix/widget-plugin-grid/selection";
import { ObjectItem } from "mendix";

export type SelectionMethod = "rowClick" | "checkbox" | "none";

export type ClickTrigger = "single" | "double" | "none";

export interface CellContext {
    item: ObjectItem;
    selectionMethod: SelectionMethod;
    selectionType: SelectionType;
    clickTrigger: ClickTrigger;
}
