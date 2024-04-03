import { ObjectItem } from "mendix";
import { SelectionMode, SelectionType } from "@mendix/widget-plugin-grid/selection";

export interface EventEntryContext {
    item: ObjectItem;
    selectionType: SelectionType;
    selectionMode: SelectionMode;
}
