import { SelectionHelper } from "./helpers";
import { MultiSelectionStatus, SelectionType, WidgetSelectionProperty } from "./types";

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

export function removeAllRanges(): void {
    window.getSelection()?.removeAllRanges();
}
