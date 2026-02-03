import { ObjectItem, Option, ValueStatus } from "mendix";
import { association, equals, literal } from "mendix/filters/builders";
import { useCallback, useEffect, useRef, useState } from "react";
import { TreeNodeContainerProps } from "../../../typings/TreeNodeProps";
import { InfoTreeNodeItem, TreeNodeItem } from "../TreeNode";

function mapDataSourceItemToTreeNodeItem(item: ObjectItem, props: TreeNodeContainerProps): TreeNodeItem {
    return {
        ...item,
        headerContent:
            props.headerType === "text" ? props.headerCaption?.get(item).value : props.headerContent?.get(item),
        bodyContent: props.children?.get(item),
        isUserDefinedLeafNode: props.hasChildren?.get(item).value === false
    };
}

/*
 * Hook to manage Infinite Tree Nodes functionality
 * it allows fetching children based on parent association with javascript Promise pattern
 * and then it will resolved the promise when datasource updates comes from the framework
 */
export function useInfiniteTreeNodes(props: TreeNodeContainerProps): {
    treeNodeItems: TreeNodeItem[] | InfoTreeNodeItem | null;
    fetchChildren: (item?: Option<ObjectItem>) => Promise<TreeNodeItem[]>;
    isInfiniteTreeNodesEnabled: boolean;
} {
    const { datasource } = props;
    const isInfiniteTreeNodesEnabled = !!props.parentAssociation;
    const fetchingItem = useRef<Option<ObjectItem> | undefined>(undefined);
    const resolvePromise = useRef<(value: TreeNodeItem[]) => void | undefined>(undefined);
    const [treeNodeItems, setTreeNodeItems] = useState<TreeNodeItem[] | InfoTreeNodeItem | null>([]);

    // retrieve new datasource based on parents association
    const filterContent = useCallback(
        (item: Option<ObjectItem>) => {
            if (props.parentAssociation) {
                return equals(association(props.parentAssociation?.id), literal(item));
            }
        },
        [props.parentAssociation]
    );

    // trigger fetch children via datasource.setFilter
    const fetchChildren = useCallback(
        (item?: Option<ObjectItem>) => {
            return new Promise<TreeNodeItem[]>(resolve => {
                if (isInfiniteTreeNodesEnabled && fetchingItem.current === undefined) {
                    fetchingItem.current = item;
                    resolvePromise.current = resolve;
                    datasource.setFilter(filterContent(item));
                }
            });
        },
        [filterContent, datasource, isInfiniteTreeNodesEnabled]
    );

    // Update treeNodeItems when datasource changes
    useEffect(() => {
        // only get the items when datasource is actually available
        // this is to prevent treenode resetting it's render while datasource is loading.
        if (datasource.status === ValueStatus.Available) {
            if (datasource.items && datasource.items.length) {
                const items = datasource.items.map(item => mapDataSourceItemToTreeNodeItem(item, props));
                if (isInfiniteTreeNodesEnabled && fetchingItem.current && resolvePromise.current) {
                    resolvePromise.current(items);
                }
                if (Array.isArray(treeNodeItems) && treeNodeItems.length <= 0) {
                    setTreeNodeItems(items);
                }
            } else {
                resolvePromise.current?.([]);
                setTreeNodeItems({
                    Message: "No data available"
                });
            }
            resolvePromise.current = undefined;
            fetchingItem.current = undefined;
        }
    }, [datasource.status, datasource.items]);

    // Initial Load of Top Level TreeNode Items
    useEffect(() => {
        fetchChildren(undefined);
    }, [fetchChildren, isInfiniteTreeNodesEnabled]);

    return { treeNodeItems, fetchChildren, isInfiniteTreeNodesEnabled };
}

/*
 * Localized TreeNodeItems for Infinite Tree Nodes
 * This allows each TreeNode to manage its own items when children are fetched
 * without affecting other TreeNodes
 * when infinite tree nodes is enabled
 * otherwise it will just use the items passed via props
 */
export function useLocalizedTreeNode(
    items: TreeNodeItem[] | InfoTreeNodeItem | null,
    isInfiniteTreeNodesEnabled: boolean
): {
    localizedItems: TreeNodeItem[] | InfoTreeNodeItem | null;
    appendChildren: (items: TreeNodeItem[], parent: TreeNodeItem) => void;
} {
    const [localizedItems, setLocalizedItems] = useState<TreeNodeItem[] | InfoTreeNodeItem | null>(items);
    const appendChildren = useCallback(
        (items: TreeNodeItem[], parent: TreeNodeItem): void => {
            setLocalizedItems(
                Array.isArray(localizedItems) && isInfiniteTreeNodesEnabled
                    ? localizedItems.map(item => {
                          if (item.id === parent.id) {
                              return {
                                  ...item,
                                  children: items
                              };
                          }
                          return item;
                      })
                    : localizedItems
            );
        },
        [localizedItems, isInfiniteTreeNodesEnabled]
    );
    useEffect(() => {
        if (isInfiniteTreeNodesEnabled) {
            if (Array.isArray(items)) {
                setLocalizedItems(items);
            }
        }
    }, [items, isInfiniteTreeNodesEnabled]);

    return { localizedItems: isInfiniteTreeNodesEnabled ? localizedItems : items, appendChildren };
}
