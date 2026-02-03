import { ValueStatus } from "mendix";
import { ReactElement, useMemo } from "react";
import { TreeNodeContainerProps } from "../typings/TreeNodeProps";
import { TreeNode as TreeNodeComponent } from "./components/TreeNode";
import { useInfiniteTreeNodes } from "./components/hooks/useInfiniteTreeNodes";

export function TreeNode(props: TreeNodeContainerProps): ReactElement {
    const expandedIcon = useMemo(
        () => (props.expandedIcon?.status === ValueStatus.Available ? props.expandedIcon.value : undefined),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [props.expandedIcon?.status]
    );
    const collapsedIcon = useMemo(
        () => (props.collapsedIcon?.status === ValueStatus.Available ? props.collapsedIcon.value : undefined),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [props.collapsedIcon?.status]
    );

    const { treeNodeItems, fetchChildren, isInfiniteTreeNodesEnabled } = useInfiniteTreeNodes(props);

    return (
        <TreeNodeComponent
            class={props.class}
            style={props.style}
            items={treeNodeItems}
            startExpanded={props.startExpanded}
            showCustomIcon={Boolean(props.expandedIcon) || Boolean(props.collapsedIcon)}
            iconPlacement={props.showIcon}
            expandedIcon={expandedIcon}
            collapsedIcon={collapsedIcon}
            tabIndex={props.tabIndex}
            animateIcon={props.animate && props.animateIcon}
            animateTreeNodeContent={props.animate}
            openNodeOn={props.openNodeOn}
            fetchChildren={fetchChildren}
            isInfiniteTreeNodesEnabled={isInfiniteTreeNodesEnabled}
        />
    );
}
