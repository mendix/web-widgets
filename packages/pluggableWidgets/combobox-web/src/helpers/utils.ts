import { MultiSelector } from "./types";

export function getSelectedCaptionsPlaceholder(selector: MultiSelector, selectedItems: string[]): string {
    if (selector.selectedItemsStyle !== "text") {
        return "";
    }
    if (selectedItems.length === 0) {
        return selector.caption.emptyCaption;
    }

    return selectedItems.map(v => selector.caption.get(v)).join(", ");
}
