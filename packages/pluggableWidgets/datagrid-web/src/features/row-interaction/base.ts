import { ObjectItem } from "mendix";

export type SelectionMethod = "rowClick" | "checkbox" | "none";

export type ClickTrigger = "single" | "double" | "none";

export interface CellContext {
    item: ObjectItem;
    selectionMethod: SelectionMethod;
    clickTrigger: ClickTrigger;
}
