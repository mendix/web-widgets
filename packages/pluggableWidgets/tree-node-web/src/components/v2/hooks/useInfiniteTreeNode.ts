import { ObjectItem, Option } from "mendix";
import { association, equals, literal, or } from "mendix/filters/builders";
import { useCallback, useEffect, useRef } from "react";
import { deriveDesiredParentIds, getItemId } from "./helpers";
import { TreeNodeV2DataItem } from "./useIncrementalTreeData";
import { TreeNodeContainerProps } from "../../../../typings/TreeNodeProps";

export type ItemType = Array<Option<ObjectItem>>;

/**
 * Keeps the datasource filter in sync with what the tree currently needs: the children of every
 * rendered node, plus one level past it. The set is *derived* from `treeData` on every delivery —
 * this hook keeps no record of what it has already fetched, which is what let a replaced result
 * set (a gallery filtering the tree by department) leave every node without an expand affordance.
 * See `design.md` D6.
 */
export function useInfiniteTreeNodes(
    props: TreeNodeContainerProps,
    treeData: TreeNodeV2DataItem[]
): { syncPreloadFilter: () => void } {
    const { datasource, parentAssociation, startExpanded } = props;
    const initializedRef = useRef(false);
    // The only state this hook holds: the parent ids the last setFilter call asked for, as a
    // comparison key, so re-deriving the same set is a no-op instead of another retrieve.
    const lastAppliedKeyRef = useRef<string | null>(null);

    const getDatasourceFilter = useCallback(
        (items?: ItemType) => {
            if (items && items.length > 1) {
                // retrieve new datasource for array of items
                return or(...items.map(item => equals(association(parentAssociation!.id), literal(item))));
            } else {
                return equals(association(parentAssociation!.id), literal(items?.[0]));
            }
        },
        [parentAssociation]
    );

    const applyFilter = useCallback(
        (items: ItemType) => {
            const key = items
                .map(item => (item === undefined ? "" : getItemId(item)))
                .sort()
                .join("\u0000");

            if (key === lastAppliedKeyRef.current) {
                return;
            }

            lastAppliedKeyRef.current = key;
            datasource.setFilter(getDatasourceFilter(items));
        },
        [datasource, getDatasourceFilter]
    );

    const syncPreloadFilter = useCallback(() => {
        const items = datasource.items;

        // Nothing to derive from: the datasource is still loading, or delivered nothing at all.
        // `undefined` (the root level) is always part of the filter, so a delivery can only be
        // empty when there is genuinely nothing to show.
        if (items === undefined || items.length === 0) {
            return;
        }

        // Only the current delivery's objects may go into the filter. The tree deliberately keeps
        // nodes a delivery did not mention, and their `item` reference would be a stale one.
        const deliveredById = new Map<string, ObjectItem>(items.map(item => [getItemId(item), item]));
        const desiredIds = deriveDesiredParentIds(treeData, new Set(deliveredById.keys()));

        applyFilter([undefined, ...desiredIds.map(id => deliveredById.get(id)!)]);
    }, [datasource, treeData, applyFilter]);

    useEffect(() => {
        if (initializedRef.current) {
            syncPreloadFilter();
            return;
        }

        initializedRef.current = true;

        // On the very first pass there is no tree to derive from yet. When only roots are expanded,
        // ask for the root level and let the derivation take over from the first real delivery.
        // When "Start expanded" is Yes, apply no filter at all: a non-microflow datasource then
        // returns the whole table in one retrieve, and the set derived from it is already stable —
        // starting from the root level instead would cost one retrieve per level of depth.
        if (!startExpanded) {
            applyFilter([undefined]);
        }
    }, [syncPreloadFilter, applyFilter, startExpanded]);

    return { syncPreloadFilter };
}
