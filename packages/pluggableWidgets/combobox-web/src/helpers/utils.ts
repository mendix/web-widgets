import { ComboboxPreviewProps } from "typings/ComboboxProps";
import { MultiSelector } from "./types";
import { PropsWithChildren, ReactElement, createElement } from "react";

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

export interface CaptionContentProps extends PropsWithChildren {
    htmlFor?: string;
    onClick?: (e: MouseEvent) => void;
}

export function CaptionContent(props: CaptionContentProps): ReactElement {
    const { htmlFor, children, onClick } = props;
    return createElement(htmlFor == null ? "span" : "label", {
        children,
        className: "widget-combobox-caption-text",
        htmlFor,
        onClick: onClick
            ? onClick
            : htmlFor
            ? (e: MouseEvent) => {
                  e.preventDefault();
              }
            : undefined
    });
}

export function getDatasourcePlaceholderText(args: ComboboxPreviewProps): string {
    const {
        optionsSourceType,
        optionsSourceAssociationDataSource,
        attributeEnumeration,
        attributeBoolean,
        attributeString,
        emptyOptionText,
        source,
        optionsSourceDatabaseDataSource
    } = args;
    const emptyStringFormat = emptyOptionText ? `[${emptyOptionText}]` : "Combo box";
    if (source === "context") {
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
    } else if (source === "database" && optionsSourceDatabaseDataSource) {
        return (optionsSourceDatabaseDataSource as { caption?: string })?.caption || `${source}, ${attributeString}`;
    }
    return emptyStringFormat;
}
