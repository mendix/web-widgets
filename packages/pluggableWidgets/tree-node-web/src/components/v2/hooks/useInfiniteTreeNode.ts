import { ObjectItem, Option } from "mendix";
import { association, equals, literal, or } from "mendix/filters/builders";
import { useCallback, useEffect, useRef } from "react";
import { getItemId } from "./helpers";
import { TreeNodeContainerProps } from "../../../../typings/TreeNodeProps";

export type ItemType = Array<Option<ObjectItem>>;

export function useInfiniteTreeNodes(props: TreeNodeContainerProps): {
    items: ObjectItem[] | undefined;
    appendItems: (newItem: ObjectItem, children?: ObjectItem[]) => void;
} {
    const { datasource, parentAssociation, startExpanded } = props;
    // loadedParents : track the nodes that are expanded
    const loadedParentsByIdRef = useRef<Map<string, ObjectItem>>(new Map());
    // loadedChilds : track the pre-loaded nodes of expanded nodes.
    const loadedChildsByIdRef = useRef<Map<string, ObjectItem>>(new Map());
    const initializedRef = useRef(false);
    // Used only when startExpanded is false (only roots auto-expand; deeper tiers resolve via a
    // real click through appendItems). Round 1 (pre-existing): preload roots' children, gated on
    // content (loadedParentsByIdRef actually being populated), not on fire-count — so it retries
    // harmlessly while the datasource is still empty/loading, and only locks in once real data
    // lands. Round 2: once roots' children genuinely arrive, preload one level further for them
    // too — same content-based gating, so it can't burn its one shot on a transient empty
    // delivery before the real children show up.
    const round1DoneRef = useRef(false);
    const round2DoneRef = useRef(false);

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

    const getExpandedFilterItems = useCallback(
        (): ItemType => [undefined, ...loadedParentsByIdRef.current.values(), ...loadedChildsByIdRef.current.values()],
        []
    );

    const appendItems = useCallback(
        (newItem: ObjectItem, children?: ObjectItem[]) => {
            const parentId = getItemId(newItem);

            if (children && children.length > 0) {
                children.forEach(child => {
                    const childId = getItemId(child);
                    // get all expanded node's children Id, in order to pre-load them
                    // this is needed to be able to know if a node has further level children before expanding it.
                    // Runs on every expand, including the first one — a node's own children being
                    // preloaded as part of its parent's expand must not delay preloading its grandchildren too.
                    loadedChildsByIdRef.current.set(childId, child);
                });
            }

            // if the new item is already in loadedChilds,
            // it means that it was pre-loaded as a child of an expanded node,
            // so we need to move it to loadedParents
            if (loadedChildsByIdRef.current.has(parentId)) {
                loadedParentsByIdRef.current.set(parentId, loadedChildsByIdRef.current.get(parentId)!);
                loadedChildsByIdRef.current.delete(parentId);
            } else {
                loadedParentsByIdRef.current.set(parentId, newItem);
            }

            datasource.setFilter(getDatasourceFilter(getExpandedFilterItems()));
        },
        [datasource, getDatasourceFilter, getExpandedFilterItems]
    );

    useEffect(() => {
        if (initializedRef.current) {
            if (startExpanded) {
                // Every level defaults to EXPANDED under "Start expanded" = Yes (not just roots),
                // so keep treating newly-arrived items as loaded-parents and fetching their
                // children, for as long as new descendants keep appearing. Self-terminating:
                // once a round finds nothing new, it stops calling setFilter — bounded by the
                // tree's real depth, not an arbitrary count.
                let addedAny = false;
                datasource.items?.forEach(item => {
                    const id = getItemId(item);
                    if (!loadedParentsByIdRef.current.has(id)) {
                        loadedParentsByIdRef.current.set(id, item);
                        addedAny = true;
                    }
                });
                if (addedAny) {
                    datasource.setFilter(getDatasourceFilter(getExpandedFilterItems()));
                }
                return;
            }

            if (!round1DoneRef.current) {
                // after the first load of the datasource,
                // we want to pre-load the child nodes of roots
                if (loadedParentsByIdRef.current.size === 0) {
                    datasource.items?.forEach(item => {
                        const parentId = getItemId(item);
                        loadedParentsByIdRef.current.set(parentId, item);
                    });
                }
                if (loadedParentsByIdRef.current.size > 0) {
                    round1DoneRef.current = true;
                }
                datasource.setFilter(getDatasourceFilter(getExpandedFilterItems()));
                return;
            }

            if (!round2DoneRef.current) {
                // Roots' children have arrived — preload one level further for them too,
                // exactly like appendItems does for a manually expanded node, so their own
                // expand affordance is known without an extra click. Only advances once real
                // (not-yet-tracked) items are actually found, so it can't lock in prematurely
                // on a transient empty/unchanged delivery.
                let addedAny = false;
                datasource.items?.forEach(item => {
                    const id = getItemId(item);
                    if (!loadedParentsByIdRef.current.has(id) && !loadedChildsByIdRef.current.has(id)) {
                        loadedChildsByIdRef.current.set(id, item);
                        addedAny = true;
                    }
                });
                if (addedAny) {
                    round2DoneRef.current = true;
                    datasource.setFilter(getDatasourceFilter(getExpandedFilterItems()));
                }
            }

            return;
        }

        initializedRef.current = true;
        loadedParentsByIdRef.current.clear();
        round1DoneRef.current = false;
        round2DoneRef.current = false;

        // when datasource is loaded for the first time, we want to load only the root nodes (nodes without parent)
        // if startExpanded is false, otherwise we want to load all nodes
        if (!startExpanded) {
            datasource.setFilter(getDatasourceFilter([undefined]));
        }
    }, [datasource, getDatasourceFilter, getExpandedFilterItems, startExpanded]);

    return {
        items: datasource.items,
        appendItems
    };
}
