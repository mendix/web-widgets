import { ObjectItem, Option } from "mendix";
import { association, equals, literal, or } from "mendix/filters/builders";
import { useCallback, useEffect, useRef } from "react";
import { TreeNodeContainerProps } from "../../../../typings/TreeNodeProps";

export type ItemType = Array<Option<ObjectItem>>;

export function useInfiniteTreeNodes(props: TreeNodeContainerProps) {
    const { datasource, parentAssociation } = props;
    const loadedParentsByIdRef = useRef<Map<string, ObjectItem>>(new Map());
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
            const parentId = String(newItem.id);

            if (loadedParentsByIdRef.current.has(parentId)) {
                if (children && children.length > 0) {
                    children.forEach(child => {
                        const childId = String(child.id);
                        loadedChildsByIdRef.current.set(childId, child);
                    });

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
            if (loadedParentsByIdRef.current.size === 0) {
                datasource.items?.forEach(item => {
                    const parentId = String(item.id);
                    loadedParentsByIdRef.current.set(parentId, item);
                });
            }

            datasource.setFilter(getDatasourceFilter(getExpandedFilterItems()));

            return;
        }

        initializedRef.current = true;
        loadedParentsByIdRef.current.clear();
        datasource.setFilter(getDatasourceFilter([undefined]));
    }, [datasource, getDatasourceFilter, getExpandedFilterItems]);

    return {
        items: datasource.items,
        appendItems
    };
}
