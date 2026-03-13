import classNames from "classnames";
import { ObjectItem, WebIcon } from "mendix";
import { CSSProperties, ReactElement, ReactNode, useCallback, useContext } from "react";
import { OpenNodeOnEnum, TreeNodeContainerProps } from "../../typings/TreeNodeProps";

import { renderTreeNodeHeaderIcon, TreeNodeHeaderIcon } from "./HeaderIcon";
import { TreeNodeBranch, TreeNodeBranchProps, treeNodeBranchUtils } from "./TreeNodeBranch";
import { TreeNodeBranchContext, useInformParentContextOfChildNodes } from "./TreeNodeBranchContext";
import { useTreeNodeFocusChangeHandler } from "./hooks/TreeNodeAccessibility";
import { ItemType, useLocalizedTreeNode } from "./hooks/useInfiniteTreeNodes";
import { useTreeNodeRef } from "./hooks/useTreeNodeRef";

export interface TreeNodeItem extends ObjectItem {
    headerContent: ReactNode;
    bodyContent: ReactNode;
    isUserDefinedLeafNode: boolean;
    children?: TreeNodeItem[];
    parentId?: string | null | undefined;
}

export interface InfoTreeNodeItem {
    Message: string;
}

export interface TreeNodeProps extends Pick<TreeNodeContainerProps, "tabIndex"> {
    class: string;
    style?: CSSProperties;
    items: TreeNodeItem[] | InfoTreeNodeItem | null;
    startExpanded: TreeNodeBranchProps["startExpanded"];
    showCustomIcon: boolean;
    iconPlacement: TreeNodeBranchProps["iconPlacement"];
    expandedIcon?: WebIcon;
    collapsedIcon?: WebIcon;
    animateIcon: boolean;
    animateTreeNodeContent: TreeNodeBranchProps["animateTreeNodeContent"];
    openNodeOn: OpenNodeOnEnum;
    fetchChildren: (item?: ItemType) => Promise<TreeNodeItem[]>;
    isInfiniteTreeNodesEnabled: boolean;
}

export function TreeNode(props: TreeNodeProps): ReactElement | null {
    const {
        class: className,
        items,
        style,
        showCustomIcon,
        startExpanded,
        iconPlacement,
        expandedIcon,
        collapsedIcon,
        tabIndex,
        animateIcon,
        animateTreeNodeContent,
        openNodeOn,
        fetchChildren,
        isInfiniteTreeNodesEnabled
    } = props;
    const { level } = useContext(TreeNodeBranchContext);
    // localized items if infinite tree nodes is enabled,
    // this is to allow each nodes updates their own items when children are fetched
    const { localizedItems: localItems, appendChildren } = useLocalizedTreeNode(
        items,
        isInfiniteTreeNodesEnabled,
        fetchChildren
    );
    const [treeNodeElement, updateTreeNodeElement] = useTreeNodeRef();

    const renderHeaderIconCallback = useCallback<TreeNodeHeaderIcon>(
        (treeNodeState, iconPlacement) =>
            renderTreeNodeHeaderIcon(treeNodeState, iconPlacement, {
                animateIcon,
                collapsedIcon,
                expandedIcon,
                showCustomIcon
            }),
        [collapsedIcon, expandedIcon, showCustomIcon, animateIcon]
    );

    const isInsideAnotherTreeNode = useCallback(() => {
        return treeNodeElement?.parentElement?.className.includes(treeNodeBranchUtils.bodyClassName) ?? false;
    }, [treeNodeElement]);

    useInformParentContextOfChildNodes(Array.isArray(localItems) ? localItems.length : 0, isInsideAnotherTreeNode);

    const changeTreeNodeBranchHeaderFocus = useTreeNodeFocusChangeHandler();

    if (localItems === null || (Array.isArray(localItems) && localItems.length === 0)) {
        return null;
    }

    return (
        <ul
            className={classNames("widget-tree-node", className)}
            style={style}
            ref={updateTreeNodeElement}
            data-focusindex={tabIndex || 0}
            role={level === 0 ? "tree" : "group"}
        >
            {Array.isArray(localItems) &&
                localItems.map(item => {
                    return (
                        <TreeNodeBranch
                            key={item.id}
                            item={item}
                            startExpanded={startExpanded}
                            iconPlacement={iconPlacement}
                            renderHeaderIcon={renderHeaderIconCallback}
                            changeFocus={changeTreeNodeBranchHeaderFocus}
                            animateTreeNodeContent={animateTreeNodeContent}
                            openNodeOn={openNodeOn}
                            fetchChildren={fetchChildren}
                            isInfiniteTreeNodesEnabled={isInfiniteTreeNodesEnabled}
                            appendChildren={appendChildren}
                            treeNodeProps={props}
                        >
                            {item.bodyContent}
                        </TreeNodeBranch>
                    );
                })}
        </ul>
    );
}

export const enum TreeNodeState {
    COLLAPSED_WITH_JS = "COLLAPSED_WITH_JS",
    COLLAPSED_WITH_CSS = "COLLAPSED_WITH_CSS",
    EXPANDED = "EXPANDED",
    LOADING = "LOADING"
}
