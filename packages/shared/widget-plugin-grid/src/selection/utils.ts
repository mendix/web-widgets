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

export function blockUserSelect(): void {
    document.body.style.userSelect = "none";
}

type UnblockUserSelectFn = {
    (): void;
    timeoutId?: number;
};

export const unblockUserSelect: UnblockUserSelectFn = () => {
    if (unblockUserSelect.timeoutId) {
        clearTimeout(unblockUserSelect.timeoutId);
    }
    unblockUserSelect.timeoutId = window.setTimeout(() => {
        removeAllRanges();
        document.body.style.userSelect = "";
        unblockUserSelect.timeoutId = undefined;
    }, 250);
};
