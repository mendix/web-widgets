import { ObjectItem } from "mendix";
import { SelectionMode, SelectionType } from "@mendix/widget-plugin-grid/selection";
import { ClickTrigger } from "@mendix/widget-plugin-grid/helpers/ClickActionHelper";
export interface EventEntryContext {
    item: ObjectItem;
    selectionType: SelectionType;
    clickTrigger: ClickTrigger;
    selectionMode: SelectionMode;
}
