import { ObjectItem, Option } from "mendix";
import { association, equals, literal, or } from "mendix/filters/builders";
import { useCallback, useEffect, useRef } from "react";
import { getItemId, getParentId } from "./helpers";
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
    // expandedIds : nodes the user opened, their children need to be pre-loaded as they arrive.
    const expandedIdsRef = useRef<Set<string>>(new Set());
    const initializedRef = useRef(false);

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
            expandedIdsRef.current.add(parentId);

            // The expanded node is a loaded parent now, it is no longer a pre-loaded child.
            loadedParentsByIdRef.current.set(parentId, newItem);
            loadedChildsByIdRef.current.delete(parentId);

            children?.forEach(child => {
                const childId = getItemId(child);
                // pre-load the children of the expanded node,
                // this is needed to be able to know if a node has further level children before expanding it.
                if (!loadedParentsByIdRef.current.has(childId)) {
                    loadedChildsByIdRef.current.set(childId, child);
                }
            });

            datasource.setFilter(getDatasourceFilter(getExpandedFilterItems()));
        },
        [datasource, getDatasourceFilter, getExpandedFilterItems]
    );

    useEffect(() => {
        if (initializedRef.current) {
            // after the first load of the datasource,
            // we want to pre-load the child nodes of roots
            if (loadedParentsByIdRef.current.size === 0) {
                datasource.items?.forEach(item => {
                    const parentId = getItemId(item);
                    loadedParentsByIdRef.current.set(parentId, item);
                });
                datasource.setFilter(getDatasourceFilter(getExpandedFilterItems()));
                return;
            }

            // children of an expanded node can arrive after the expansion, or be added later on.
            // pre-load them here as well, so every visible node knows whether it has children.
            let hasNewChilds = false;
            datasource.items?.forEach(item => {
                const itemId = getItemId(item);

                if (loadedParentsByIdRef.current.has(itemId) || loadedChildsByIdRef.current.has(itemId)) {
                    return;
                }

                const parentId = getParentId(item, parentAssociation);
                if (parentId && expandedIdsRef.current.has(parentId)) {
                    loadedChildsByIdRef.current.set(itemId, item);
                    hasNewChilds = true;
                }
            });

            if (hasNewChilds) {
                datasource.setFilter(getDatasourceFilter(getExpandedFilterItems()));
            }

            return;
        }

        initializedRef.current = true;
        loadedParentsByIdRef.current.clear();

        // when datasource is loaded for the first time, we want to load only the root nodes (nodes without parent)
        // if startExpanded is false, otherwise we want to load all nodes
        if (!startExpanded) {
            datasource.setFilter(getDatasourceFilter([undefined]));
        }
    }, [datasource, getDatasourceFilter, getExpandedFilterItems, parentAssociation, startExpanded]);

    return {
        items: datasource.items,
        appendItems
    };
}
