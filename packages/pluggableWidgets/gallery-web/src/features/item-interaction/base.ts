import { ObjectItem } from "mendix";
import { SelectionType } from "@mendix/widget-plugin-grid/selection";

export interface EventEntryContext {
    item: ObjectItem;
    selectionType: SelectionType;
}
