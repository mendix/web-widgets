import { GUID, ObjectItem, Option, ValueStatus } from "mendix";
import { association, equals, literal } from "mendix/filters/builders";
import { ReactElement, useCallback, useContext, useEffect, useId, useState } from "react";
import { TreeNodeContainerProps } from "../typings/TreeNodeProps";
import { TreeNodeComponent } from "./components/TreeNodeComponent";
import { TreeNodeBranchContext } from "./components/TreeNodeBranchContext";

type treeNodeGraph = {
    parentObject: ObjectItem;
    items: ObjectItem[];
};

export function TreeNode(props: TreeNodeContainerProps): ReactElement {
    const { datasource } = props;
    const rootId = useId();

    const [treeNodeItems, setTreeNodeItems] = useState(new Map<Option<GUID> | string, treeNodeGraph>());
    const { level, parent } = useContext(TreeNodeBranchContext);

    const filterContent = useCallback(
        (item: Option<ObjectItem>) => {
            if (props.parentAssociation) {
                return equals(association(props.parentAssociation?.id), literal(item));
            }
        },
        [props.parentAssociation, treeNodeItems, parent, rootId]
    );

    useEffect(() => {
        // Initial Load of Top Level Items
        datasource.setFilter(filterContent(parent?.id ? treeNodeItems.get(parent!.id)?.parentObject : undefined));
    }, []);

    useEffect(() => {
        // only get the items when datasource is actually available
        // this is to prevent treenode resetting it's render while datasource is loading.
        if (datasource.status === ValueStatus.Available) {
            const updatedItems = new Map(treeNodeItems);
            if (datasource.items && datasource.items.length) {
                updatedItems.set(parent?.id || rootId, { items: datasource.items, parentObject: parent! });
            } else {
                updatedItems.set(parent?.id || rootId, { items: [], parentObject: parent! });
            }
            setTreeNodeItems(updatedItems);
        }
    }, [datasource.status, datasource.items]);
    const expandedIcon = props.expandedIcon?.status === ValueStatus.Available ? props.expandedIcon.value : undefined;
    const collapsedIcon = props.collapsedIcon?.status === ValueStatus.Available ? props.collapsedIcon.value : undefined;

    return (
        <TreeNodeComponent
            {...props}
            items={treeNodeItems.get(parent?.id || rootId)?.items || null}
            showCustomIcon={Boolean(props.expandedIcon) || Boolean(props.collapsedIcon)}
            expandedIcon={expandedIcon}
            collapsedIcon={collapsedIcon}
            level={level || 0}
        />
    );
}
