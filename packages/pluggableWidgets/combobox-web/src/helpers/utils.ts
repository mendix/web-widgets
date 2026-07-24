import { Big } from "big.js";
import { matchSorter, MatchSorterOptions } from "match-sorter";
import { createElement, PropsWithChildren, ReactElement } from "react";
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

export function getInputLabel(inputId: string): Element | null {
    return document.querySelector(`label[for="${inputId}"]`);
}

export function getValidationErrorId(inputId?: string): string | undefined {
    return inputId ? inputId + "-validation-message" : undefined;
}

/**
 * Computes aria-label and aria-labelledby values for combobox input element.
 *
 * Announcement logic:
 * - With selection (open or closed): Announce "name, selected value(s)"
 * - Without selection: Announce "name" only
 *
 * Name source:
 * - hasLabel = true: Use visible label via aria-labelledby
 * - hasLabel = false: Use fallback aria-label
 *
 * Note: aria-labelledby has the highest precedence in the ARIA spec, so when we want
 * aria-label to be announced, we must NOT set aria-labelledby at all.
 */
export function getComboboxAriaLabels(params: {
    hasSelection: boolean;
    selectedValue: string;
    inputLabel: Element | null;
    labelledBy: string | undefined;
    fallbackAriaLabel?: string;
}): { ariaLabel: string | undefined; ariaLabelledBy: string | undefined } {
    const { hasSelection, selectedValue, inputLabel, labelledBy, fallbackAriaLabel } = params;

    const hasLabel = Boolean(inputLabel);
    const labelText = inputLabel?.textContent?.trim() || fallbackAriaLabel;

    let ariaLabel: string | undefined;

    // With selection: announce both name and selected value(s)
    if (hasSelection) {
        const name = hasLabel ? labelText : fallbackAriaLabel;
        ariaLabel = name ? `${name}, ${selectedValue}` : selectedValue;
    }
    // No visible label: always use fallback aria-label
    else if (!hasLabel) {
        ariaLabel = fallbackAriaLabel;
    }
    // Otherwise: use aria-labelledby for visible label (when no selection)

    return {
        ariaLabel,
        ariaLabelledBy: ariaLabel ? undefined : hasLabel ? labelledBy : undefined
    };
}
