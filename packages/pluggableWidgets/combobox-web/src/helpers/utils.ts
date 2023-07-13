import { DynamicValue } from "mendix";
import { MultiSelector } from "./types";

export function getSelectedCaptionsPlaceholder(
    selector: MultiSelector,
    selectedItems: string[],
    withCheckbox: boolean,
    emptyOptionText: DynamicValue<string> | undefined
): string {
    if (!withCheckbox) {
        if (selectedItems.length === 0) {
            return emptyOptionText?.value as string;
        } else {
            return "";
        }
    }
    const selectedItemCaption = selectedItems.map(v => selector.caption.get(v));
    if (selectedItemCaption.length >= 3) {
        return selectedItemCaption.join();
    } else {
        return selectedItemCaption.slice(0, selectedItemCaption.length).join();
    }
}
