import { ComboboxPreviewProps } from "typings/ComboboxProps";
import { MultiSelector } from "./types";

export function getSelectedCaptionsPlaceholder(selector: MultiSelector, selectedItems: string[]): string {
    if (selectedItems.length === 0) {
        return selector.caption.emptyCaption;
    }

    if (
        selector.selectedItemsStyle !== "text" ||
        selector.customContentType === "yes" ||
        selector.selectionMethod === "rowclick"
    ) {
        return "";
    }
    return selectedItems.map(v => selector.caption.get(v)).join(", ");
}

export function getDatasourcePlaceholderText(args: ComboboxPreviewProps): string {
    const {
        optionsSourceType,
        optionsSourceAssociationDataSource,
        attributeEnumeration,
        attributeBoolean,
        emptyOptionText
    } = args;
    const emptyStringFormat = emptyOptionText ? `[${emptyOptionText}]` : "Combo box";
    switch (optionsSourceType) {
        case "association":
            return (optionsSourceAssociationDataSource as { caption?: string })?.caption || emptyStringFormat;
        case "enumeration":
            return `[${optionsSourceType}, ${attributeEnumeration}]`;
        case "boolean":
            return `[${optionsSourceType}, ${attributeBoolean}]`;
        default:
            return emptyStringFormat;
    }
}
