import { MultiSelector } from "./types";

export function getSelectedCaptionsPlaceholder(selector: MultiSelector, selectedItems: string[]): string {
    if (!selector.withCheckbox) {
        if (selectedItems.length === 0) {
            return selector.caption.emptyCaption;
        } else {
            return "";
        }
    }
    const selectedItemCaption = selectedItems.map(v => selector.caption.get(v));

    return selectedItemCaption.join(", ");
}
