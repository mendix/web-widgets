import { Big } from "big.js";
import { MatchSorterOptions, matchSorter } from "match-sorter";
import { PropsWithChildren, ReactElement, createElement } from "react";
import { ComboboxPreviewProps, FilterTypeEnum, SelectedItemsSortingEnum } from "typings/ComboboxProps";
import { MultiSelector, SortOrder } from "./types";
import { ObjectItem } from "mendix";

export const DEFAULT_LIMIT_SIZE = 100;

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

    const selected = selectedItems.map(v => selector.caption.get(v));

    return selected.join(", ");
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
        case "containsExact":
            return {
                threshold: matchSorter.rankings.CONTAINS
            };
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

export function sortSelectedItems(
    values: ObjectItem[] | null | undefined,
    sortingType: SelectedItemsSortingEnum,
    sortOrder: SortOrder,
    captionGetter: (id: string) => string | undefined
): string[] | null {
    if (values) {
        return sortSelections(
            values.map(v => (v?.id as string) ?? null),
            sortingType,
            sortOrder,
            captionGetter
        );
    } else {
        return null;
    }
}

function sortSelections(
    newValueIds: string[],
    sortingType: SelectedItemsSortingEnum,
    sortOrder: SortOrder,
    captionGetter: (id: string) => string | undefined
): string[] {
    if (sortingType === "caption") {
        return newValueIds.sort((a, b) => {
            const captionA = captionGetter(a)?.toString() ?? "";
            const captionB = captionGetter(b)?.toString() ?? "";
            return sortOrder === "asc" ? captionA.localeCompare(captionB) : captionB.localeCompare(captionA);
        });
    }
    return newValueIds;
}
