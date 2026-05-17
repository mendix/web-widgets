import { ObjectItem, Option } from "mendix";
import { association, equals, literal, or } from "mendix/filters/builders";
import { useCallback, useEffect, useRef } from "react";
import { TreeNodeContainerProps } from "../../../../typings/TreeNodeProps";
import { getItemId } from "./helpers";

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

            if (loadedParentsByIdRef.current.has(parentId)) {
                if (children && children.length > 0) {
                    children.forEach(child => {
                        const childId = getItemId(child);
                        // get all expanded node's children Id, in order to pre-load them
                        // this is needed to be able to know if a node has further level children before expanding it.
                        loadedChildsByIdRef.current.set(childId, child);
                    });

                    // if the new item is already in loadedChilds,
                    // it means that it was pre-loaded as a child of an expanded node,
                    // so we need to move it to loadedParents
                    if (loadedChildsByIdRef.current.has(parentId)) {
                        loadedParentsByIdRef.current.set(parentId, loadedChildsByIdRef.current.get(parentId)!);
                        loadedChildsByIdRef.current.delete(parentId);
                    } else {
                        loadedParentsByIdRef.current.set(parentId, newItem);
                    }
                }
            } else {
                loadedParentsByIdRef.current.set(parentId, newItem);
            }

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
    }, [datasource, getDatasourceFilter, getExpandedFilterItems, startExpanded]);

    return {
        items: datasource.items,
        appendItems
    };
}
