import { ReactElement, useContext } from "react";
import { TreeNodeBranchContext } from "./TreeNodeBranchContext";
import { TreeNodeComponent, TreeNodeComponentProps } from "./TreeNodeComponent";
import { TreeNodeRootContext } from "./TreeNodeRootContext";

export function TreeNodeRoot(props: Omit<TreeNodeComponentProps, "items" | "level">): ReactElement {
    const { level, parent } = useContext(TreeNodeBranchContext);
    const { treeNodeItems, rootId } = useContext(TreeNodeRootContext);
    const parentId = props.isInfiniteMode ? parent?.id || rootId : rootId;
    const items = treeNodeItems?.get(parentId)?.items || [];
    if (items.length === 0) {
        return <div></div>;
    }
    return <TreeNodeComponent {...props} items={items} level={level} />;
}
