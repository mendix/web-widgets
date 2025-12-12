import { atomFactory, ComputedAtom, DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { DynamicValue } from "mendix";
import { computed, observable } from "mobx";

type Item = { id: string };
type Selection = { type: "Single" } | { type: "Multi"; selection: Item[] };

/**
 * Returns selected count in multi-selection mode and -1 otherwise.
 * @injectable
 */
export function selectedCountMultiAtom(
    gate: DerivedPropsGate<{
        itemSelection?: Selection;
    }>
): ComputedAtom<number> {
    return computed(() => {
        const { itemSelection } = gate.props;
        if (itemSelection?.type === "Multi") {
            return itemSelection.selection.length;
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
        itemSelection?: Selection;
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

interface ObservableSelectorTexts {
    clearSelectionButtonLabel: string;
    selectedCountText: string;
}

export function selectionCounterTextsStore(
    gate: DerivedPropsGate<{
        clearSelectionButtonLabel?: DynamicValue<string>;
        selectedCountTemplateSingular?: DynamicValue<string>;
        selectedCountTemplatePlural?: DynamicValue<string>;
    }>,
    selectedCount: ComputedAtom<number>
): ObservableSelectorTexts {
    return observable({
        get clearSelectionButtonLabel() {
            return gate.props.clearSelectionButtonLabel?.value || "Clear selection";
        },
        get selectedCountText() {
            const formatSingular = gate.props.selectedCountTemplateSingular?.value || "%d item selected";
            const formatPlural = gate.props.selectedCountTemplatePlural?.value || "%d items selected";
            const count = selectedCount.get();

            if (count > 1) return formatPlural.replace("%d", `${count}`);
            if (count === 1) return formatSingular.replace("%d", "1");
            return "";
        }
    });
}

export interface ObservableSelectAllTexts {
    selectionStatus: string;
    selectAllLabel: string;
}

/** @injectable */
export function selectAllTextsStore(
    gate: DerivedPropsGate<{
        allSelectedText?: DynamicValue<string>;
        selectAllTemplate?: DynamicValue<string>;
        selectAllText?: DynamicValue<string>;
    }>,
    selectedCount: ComputedAtom<number>,
    selectedTexts: { selectedCountText: string },
    totalCount: ComputedAtom<number>,
    isAllItemsSelected: ComputedAtom<boolean>
): ObservableSelectAllTexts {
    return observable({
        get selectAllLabel() {
            const selectAllFormat = gate.props.selectAllTemplate?.value || "Select all %d rows in the data source";
            const selectAllText = gate.props.selectAllText?.value || "Select all rows in the data source";
            const total = totalCount.get();
            if (total > 0) return selectAllFormat.replace("%d", `${total}`);
            return selectAllText;
        },
        get selectionStatus() {
            if (isAllItemsSelected.get()) return this.allSelectedText;
            return selectedTexts.selectedCountText;
        },
        get allSelectedText() {
            const str = gate.props.allSelectedText?.value ?? "All %d rows selected.";
            const count = selectedCount.get();
            return str.replace("%d", `${count}`);
        }
    });
}
