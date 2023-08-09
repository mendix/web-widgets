import { Selector } from "./types";

export function getSelectedCaptionsPlaceholder(
    selector: Selector<string | string[]>,
    selectedItems: string[],
    withCheckbox: boolean
): string {
    if (!withCheckbox) {
        if (selectedItems.length === 0) {
            return selector.caption.emptyCaption;
        } else {
            return "";
        }
    }
    const selectedItemCaption = selectedItems.map(v => selector.caption.get(v));

    return selectedItemCaption.join();
}
