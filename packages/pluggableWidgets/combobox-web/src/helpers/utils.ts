import { MatchSorterOptions, matchSorter } from "match-sorter";
import { ComboboxPreviewProps, FilterTypeEnum } from "typings/ComboboxProps";
import { MultiSelector } from "./types";
import { PropsWithChildren, ReactElement, createElement } from "react";
import { Big } from "big.js";

type ValueType = string | Big | boolean | Date | undefined;

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
        databaseAttributeString,
        emptyOptionText,
        source,
        optionsSourceDatabaseDataSource,
        staticAttribute,
        optionsSourceStaticDataSource
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
        return (
            (optionsSourceDatabaseDataSource as { caption?: string })?.caption ||
            `${source}, ${databaseAttributeString}`
        );
    } else if (source === "static") {
        return (optionsSourceStaticDataSource as { caption?: string })?.caption || `[${source}, ${staticAttribute}]`;
    }
    return emptyStringFormat;
}

export function getFilterTypeOptions(filter: FilterTypeEnum): MatchSorterOptions<string> {
    switch (filter) {
        case "contains":
            return {};
        case "startsWith":
            return {
                threshold: matchSorter.rankings.WORD_STARTS_WITH
            };
        case "none":
            return {
                threshold: matchSorter.rankings.NO_MATCH
            };
    }
}

export function _valuesIsEqual(valueA: ValueType, valueB: ValueType): boolean {
    if (valueA === undefined || valueB === undefined) {
        return valueA === valueB;
    }
    if (valueA instanceof Big && valueB instanceof Big) {
        return valueA.eq(valueB);
    }
    if (valueA instanceof Date && valueB instanceof Date) {
        return valueA.getTime() === valueB.getTime();
    }
    return valueA === valueB;
}
