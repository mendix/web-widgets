import { GUID, ObjectItem, Option, ValueStatus } from "mendix";
import { association, equals, literal } from "mendix/filters/builders";
import { ReactElement, useCallback, useEffect, useId, useRef, useState } from "react";
import { TreeNodeContainerProps } from "../typings/TreeNodeProps";
import { TreeNodeRoot } from "./components/TreeNodeRoot";
import { TreeNodeRootContext } from "./components/TreeNodeRootContext";

type treeNodeGraph = {
    parentObject: ObjectItem | null;
    items: ObjectItem[];
};

export function TreeNode(props: TreeNodeContainerProps): ReactElement {
    const { datasource } = props;
    const rootId = useId();
    const parent = useRef<ObjectItem | null>(null);
    const [treeNodeItems, setTreeNodeItems] = useState(new Map<Option<GUID> | string, treeNodeGraph>());

    const filterContent = useCallback(
        (item: Option<ObjectItem>) => {
            if (props.parentAssociation) {
                return equals(association(props.parentAssociation?.id), literal(item));
            }
        },
        [props.parentAssociation]
    );

    const fetchChildren = useCallback(
        (item?: Option<ObjectItem>) => {
            parent.current = item || null;
            if (props.parentAssociation) {
                datasource.setFilter(filterContent(item));
            }
        },
        [filterContent, datasource, props.parentAssociation]
    );

    useEffect(() => {
        // Initial Load of Top Level Items
        if (props.parentAssociation) {
            fetchChildren(undefined);
        }
    }, []);

    useEffect(() => {
        // only get the items when datasource is actually available
        // this is to prevent treenode resetting it's render while datasource is loading.
        if (datasource.status === ValueStatus.Available) {
            const updatedItems = new Map(treeNodeItems);
            if (datasource.items && datasource.items.length) {
                updatedItems.set(parent.current?.id || rootId, {
                    items: datasource.items,
                    parentObject: parent.current ?? null
                });
            } else {
                updatedItems.set(parent.current?.id || rootId, { items: [], parentObject: parent.current ?? null });
            }
            setTreeNodeItems(updatedItems);
        }
    }, [datasource.status, datasource.items]);
    const expandedIcon = props.expandedIcon?.status === ValueStatus.Available ? props.expandedIcon.value : undefined;
    const collapsedIcon = props.collapsedIcon?.status === ValueStatus.Available ? props.collapsedIcon.value : undefined;

    return (
        <TreeNodeRootContext.Provider value={{ fetchChildren, treeNodeItems, rootId }}>
            <TreeNodeRoot
                {...props}
                // items={treeNodeItems.get(parent?.id || rootId)?.items || null}
                showCustomIcon={Boolean(props.expandedIcon) || Boolean(props.collapsedIcon)}
                expandedIcon={expandedIcon}
                collapsedIcon={collapsedIcon}
                isInfiniteMode={props.parentAssociation !== undefined}
                // level={level || 0}
            />
        </TreeNodeRootContext.Provider>
    );
}
