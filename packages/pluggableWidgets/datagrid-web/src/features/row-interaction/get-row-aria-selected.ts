import { SelectionType } from "@mendix/widget-plugin-grid/selection";

/**
 * Returns the `aria-selected` value for a grid row, or `undefined` to omit the attribute.
 *
 * When the row has a selection checkbox, that checkbox's native `checked` state already
 * conveys selection, so also setting `aria-selected` on the row makes screen readers
 * announce the same state twice ("selected" and "checked"). Row-click selection has no
 * checkbox, so there `aria-selected` is the only carrier of selection state and must stay.
 */
export function getRowAriaSelected(
    selectionType: SelectionType,
    isSelected: boolean,
    hasCheckboxColumn: boolean
): boolean | undefined {
    if (selectionType === "None" || hasCheckboxColumn) {
        return undefined;
    }

    return isSelected;
}
