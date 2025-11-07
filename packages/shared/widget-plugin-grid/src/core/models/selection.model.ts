import { atomFactory, ComputedAtom, DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { computed } from "mobx";

/** Returns selected count in multi-selection mode and -1 otherwise. */
export function selectedCountMulti(gate: {
    itemSelection?: { type: string; selection: { length: number } };
}): ComputedAtom<number> {
    return computed(() => {
        if (gate.itemSelection?.type === "Multi") {
            return gate.itemSelection.selection.length;
        }
        return -1;
    });
}

/** Returns true if all available items selected. */
export function isAllItemsSelected(
    selectedCount: number,
    itemCount: number,
    totalCount: number,
    isAllItemsPresent: boolean
): boolean {
    if (selectedCount < 1) return false;
    if (totalCount > 0) return selectedCount === totalCount;
    if (isAllItemsPresent) return selectedCount === itemCount;
    return false;
}

/** @injectable */
export const isAllItemsSelectedAtom = atomFactory(
    (
        selectedCount: ComputedAtom<number>,
        itemCount: ComputedAtom<number>,
        totalCount: ComputedAtom<number>,
        isAllItemsPresent: ComputedAtom<boolean>
    ): Parameters<typeof isAllItemsSelected> => {
        return [selectedCount.get(), itemCount.get(), totalCount.get(), isAllItemsPresent.get()];
    },
    isAllItemsSelected
);

type Item = { id: string };

/** Return true if all items on current page selected. */
export function isCurrentPageSelected(selection: Item[], items: Item[]): boolean {
    const pageIds = new Set(items.map(item => item.id));
    const selectionSubArray = selection.filter(item => pageIds.has(item.id));
    return selectionSubArray.length === pageIds.size && pageIds.size > 0;
}

/**
 * Atom returns true if all *loaded* items are selected.
 * @injectable
 */
export function isCurrentPageSelectedAtom(
    gate: DerivedPropsGate<{
        itemSelection?: { type: "Single" } | { type: "Multi"; selection: Item[] };
        datasource: { items?: Item[] };
    }>
): ComputedAtom<boolean> {
    return computed(() => {
        // Read props first to track changes
        const selection = gate.props.itemSelection;
        const items = gate.props.datasource.items ?? [];

        if (!selection || selection.type === "Single") return false;

        return isCurrentPageSelected(selection.selection, items);
    });
}
