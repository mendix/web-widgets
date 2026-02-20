import { atomFactory, ComputedAtom, DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { computed } from "mobx";

/**
 * Atom returns `-1` when item count is unknown.
 * @injectable
 */
export function itemCountAtom(
    gate: DerivedPropsGate<{ datasource: { items?: { length: number } } }>
): ComputedAtom<number> {
    return computed(() => gate.props.datasource.items?.length ?? -1, { name: "plugin:@computed:itemCountAtom" });
}

/**
 * Atom returns `-1` when total count is unavailable.
 * @injectable
 */
export function totalCountAtom(gate: DerivedPropsGate<{ datasource: { totalCount?: number } }>): ComputedAtom<number> {
    return computed(() => totalCount(gate.props.datasource));
}

export function totalCount(ds: { totalCount?: number }): number {
    return ds.totalCount ?? -1;
}

/**
 * Select offset of the datasource.
 * @injectable
 */
export function offsetAtom(gate: DerivedPropsGate<{ datasource: { offset: number } }>): ComputedAtom<number> {
    return computed(() => gate.props.datasource.offset);
}

/**
 * Selects limit of the datasource.
 * @injectable
 */
export function limitAtom(gate: DerivedPropsGate<{ datasource: { limit: number } }>): ComputedAtom<number> {
    return computed(() => gate.props.datasource.limit, { name: "plugin:@computed:limitAtom" });
}

/**
 * Selects hasMoreItems flag of the datasource.
 * @injectable
 */
export function hasMoreItemsAtom(
    gate: DerivedPropsGate<{ datasource: { hasMoreItems?: boolean } }>
): ComputedAtom<boolean | undefined> {
    return computed(() => gate.props.datasource.hasMoreItems);
}

export function isAllItemsPresent(offset: number, hasMoreItems?: boolean): boolean {
    return offset === 0 && hasMoreItems === false;
}

/**
 * Atom returns `true` if all items are present in the datasource.
 * @injectable
 */
export const isAllItemsPresentAtom = atomFactory(
    (offset: ComputedAtom<number>, hasMoreItems: ComputedAtom<boolean | undefined>) => {
        return [offset.get(), hasMoreItems.get()];
    },
    isAllItemsPresent
);
