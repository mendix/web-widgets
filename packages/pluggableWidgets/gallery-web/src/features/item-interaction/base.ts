import { ObjectItem } from "mendix";
import { ClickTrigger } from "@mendix/widget-plugin-grid/helpers/ClickActionHelper";
import { SelectionMode, SelectionType } from "@mendix/widget-plugin-grid/selection";
export interface EventEntryContext {
    item: ObjectItem;
    selectionType: SelectionType;
    clickTrigger: ClickTrigger;
    selectionMode: SelectionMode;
}
