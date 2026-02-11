import { ObjectItem, Option, ValueStatus } from "mendix";
import { association, equals, literal, or } from "mendix/filters/builders";
import { useCallback, useEffect, useRef, useState } from "react";
import { TreeNodeContainerProps } from "../../../typings/TreeNodeProps";
import { InfoTreeNodeItem, TreeNodeItem } from "../TreeNode";

export type ItemType = Option<ObjectItem> | Array<Option<ObjectItem>>;

function mapDataSourceItemToTreeNodeItem(item: ObjectItem, props: TreeNodeContainerProps): TreeNodeItem {
    return {
        ...item,
        headerContent:
            props.headerType === "text" ? props.headerCaption?.get(item).value : props.headerContent?.get(item),
        bodyContent: props.children?.get(item),
        isUserDefinedLeafNode: props.hasChildren?.get(item).value === false,
        parentId: props.parentAssociation?.get(item).value?.id
    };
}

/*
 * Hook to manage Infinite Tree Nodes functionality
 * it allows fetching children based on parent association with javascript Promise pattern
 * and then it will resolved the promise when datasource updates comes from the framework
 */
export function useInfiniteTreeNodes(props: TreeNodeContainerProps): {
    treeNodeItems: TreeNodeItem[] | InfoTreeNodeItem | null;
    fetchChildren: (item?: ItemType) => Promise<TreeNodeItem[]>;
    isInfiniteTreeNodesEnabled: boolean;
} {
    const { datasource } = props;
    const isInfiniteTreeNodesEnabled = !!props.parentAssociation;
    const fetchingItem = useRef<Option<ObjectItem> | undefined>(undefined);
    const resolvePromise = useRef<(value: TreeNodeItem[]) => void | undefined>(undefined);
    const [treeNodeItems, setTreeNodeItems] = useState<TreeNodeItem[] | InfoTreeNodeItem | null>([]);

    // retrieve new datasource based on parents association
    const filterContent = useCallback(
        (item: ItemType) => {
            if (props.parentAssociation) {
                if (Array.isArray(item)) {
                    return filterContents(item);
                } else {
                    return equals(association(props.parentAssociation?.id), literal(item));
                }
            }
        },
        [props.parentAssociation]
    );

    // retrieve new datasource for array of items
    // this is used for checking children's of children (grandchildren) when a branch is expanded
    const filterContents = useCallback(
        (items: Array<Option<ObjectItem>>) => {
            if (props.parentAssociation) {
                if (items.length > 1) {
                    return or(...items.map(item => equals(association(props.parentAssociation!.id), literal(item))));
                } else if (items.length === 1) {
                    return equals(association(props.parentAssociation!.id), literal(items[0]));
                } else {
                    return undefined;
                }
            }
        },
        [props.parentAssociation]
    );

    // trigger fetch children via datasource.setFilter
    const fetchChildren = useCallback(
        (item?: ItemType) => {
            return new Promise<TreeNodeItem[]>(resolve => {
                if (isInfiniteTreeNodesEnabled && fetchingItem.current === undefined) {
                    resolvePromise.current = resolve;
                    if (Array.isArray(item)) {
                        fetchingItem.current = item[0];
                    } else {
                        fetchingItem.current = item;
                    }
                    datasource.setFilter(filterContent(item));
                }
            });
        },
        // ignore "datasource" update triggering fetchChildren again
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [filterContent, isInfiniteTreeNodesEnabled]
    );

    // Update treeNodeItems when datasource changes
    useEffect(() => {
        // only get the items when datasource is actually available
        // this is to prevent treenode resetting it's render while datasource is loading.
        if (datasource.status === ValueStatus.Available) {
            const resolve = resolvePromise.current;
            resolvePromise.current = undefined;
            fetchingItem.current = undefined;

            if (datasource.items && datasource.items.length) {
                const items = datasource.items.map(item => mapDataSourceItemToTreeNodeItem(item, props));

                if (isInfiniteTreeNodesEnabled && resolve) {
                    // infinite treenode uses promise-style to update the children when they are fetched,
                    // so it will resolve to the proper branch that is expanding
                    // and it will only update that branch with the fetched children without affecting other branches
                    resolve(items);
                } else {
                    // for non-infinite tree nodes, it will just set the items to the top level tree node
                    if (Array.isArray(treeNodeItems) && treeNodeItems.length <= 0) {
                        setTreeNodeItems(items);
                    }
                }
            } else {
                resolve?.([]);
                setTreeNodeItems({
                    Message: "No data available"
                });
            }
        }
    }, [datasource.status, datasource.items]);

    // Initial Load of Top Level TreeNode Items
    useEffect(() => {
        fetchChildren(undefined).then(items => {
            setTreeNodeItems(items);
        });
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
    isInfiniteTreeNodesEnabled: boolean,
    fetchChildren: (item?: ItemType) => Promise<TreeNodeItem[]>
): {
    localizedItems: TreeNodeItem[] | InfoTreeNodeItem | null;
    appendChildren: (items: TreeNodeItem[], parent: TreeNodeItem) => void;
    updateItem: (item: TreeNodeItem) => void;
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

    const updateItem = useCallback(
        (item: TreeNodeItem): void => {
            setLocalizedItems(
                Array.isArray(localizedItems) && isInfiniteTreeNodesEnabled
                    ? localizedItems.map(localItem => {
                          if (localItem.id === item.id) {
                              return {
                                  ...localItem,
                                  ...item
                              };
                          }
                          return localItem;
                      })
                    : localizedItems
            );
        },
        [localizedItems, isInfiniteTreeNodesEnabled]
    );

    useEffect(() => {
        if (isInfiniteTreeNodesEnabled) {
            if (Array.isArray(items)) {
                fetchChildren(items).then(childItems => {
                    const newLocalizedItems = items.map(localItem => {
                        const currentChildItems = childItems.filter(childItem => childItem.parentId === localItem.id);
                        if (currentChildItems.length > 0) {
                            return {
                                ...localItem,
                                children: currentChildItems
                            };
                        } else {
                            return {
                                ...localItem,
                                isUserDefinedLeafNode: true
                            };
                        }
                    });
                    setLocalizedItems(newLocalizedItems);
                });
            }
        }
    }, [items, isInfiniteTreeNodesEnabled]);

    return { localizedItems: isInfiniteTreeNodesEnabled ? localizedItems : items, appendChildren, updateItem };
}
