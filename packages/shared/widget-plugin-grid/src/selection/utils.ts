import { ObjectItem } from "mendix";
import { SelectionHelper } from "./helpers";
import { MultiSelectionStatus, SelectionType, WidgetSelectionProperty } from "./types";
import { isSelected } from "./usePrimarySelectionProps";

export function getSelectionType(prop: WidgetSelectionProperty): SelectionType {
    if (prop === undefined) {
        return "None";
    }

    if (typeof prop === "object") {
        return prop.type;
    }

    if (prop === "None" || prop === "Single" || prop === "Multi") {
        return prop;
    }

    throw new Error(`Unknown selection type: ${prop}`);
}

export function getMultiSelectStatus(helper: SelectionHelper | undefined): MultiSelectionStatus {
    return helper?.type === "Multi" ? helper.selectionStatus : "none";
}

export function getAriaSelected(
    selectionType: SelectionType,
    item: ObjectItem,
    isSelected: isSelected
): boolean | undefined {
    if (selectionType === "None") {
        return;
    }

    return isSelected(item);
}

export function removeAllRanges(): void {
    window.getSelection()?.removeAllRanges();
}
