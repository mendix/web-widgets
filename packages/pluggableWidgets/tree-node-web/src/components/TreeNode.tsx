import classNames from "classnames";
import { WebIcon, ObjectItem } from "mendix";
import { createElement, CSSProperties, ReactElement, ReactNode, useCallback, useContext } from "react";

import { OpenNodeOnEnum, TreeNodeContainerProps } from "../../typings/TreeNodeProps";

import { useTreeNodeFocusChangeHandler } from "./hooks/TreeNodeAccessibility";
import { useTreeNodeRef } from "./hooks/useTreeNodeRef";
import { renderTreeNodeHeaderIcon, TreeNodeHeaderIcon } from "./HeaderIcon";
import { TreeNodeBranch, TreeNodeBranchProps, treeNodeBranchUtils } from "./TreeNodeBranch";
import { TreeNodeBranchContext, useInformParentContextOfChildNodes } from "./TreeNodeBranchContext";

export interface TreeNodeItem extends ObjectItem {
    headerContent: ReactNode;
    bodyContent: ReactNode;
}

export interface TreeNodeProps extends Pick<TreeNodeContainerProps, "tabIndex"> {
    class: string;
    style?: CSSProperties;
    items: TreeNodeItem[] | null;
    isUserDefinedLeafNode: TreeNodeBranchProps["isUserDefinedLeafNode"];
    startExpanded: TreeNodeBranchProps["startExpanded"];
    showCustomIcon: boolean;
    iconPlacement: TreeNodeBranchProps["iconPlacement"];
    expandedIcon?: WebIcon;
    collapsedIcon?: WebIcon;
    animateIcon: boolean;
    animateTreeNodeContent: TreeNodeBranchProps["animateTreeNodeContent"];
    openNodeOn: OpenNodeOnEnum;
}

export function TreeNode({
    class: className,
    items,
    style,
    isUserDefinedLeafNode,
    showCustomIcon,
    startExpanded,
    iconPlacement,
    expandedIcon,
    collapsedIcon,
    tabIndex,
    animateIcon,
    animateTreeNodeContent,
    openNodeOn
}: TreeNodeProps): ReactElement | null {
    const { level } = useContext(TreeNodeBranchContext);
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

    useInformParentContextOfChildNodes(items?.length ?? 0, isInsideAnotherTreeNode);

    const changeTreeNodeBranchHeaderFocus = useTreeNodeFocusChangeHandler();

    if (items === null || items.length === 0) {
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
            {items.map(({ id, headerContent, bodyContent }) => (
                <TreeNodeBranch
                    key={id}
                    id={id}
                    headerContent={headerContent}
                    isUserDefinedLeafNode={isUserDefinedLeafNode}
                    startExpanded={startExpanded}
                    iconPlacement={iconPlacement}
                    renderHeaderIcon={renderHeaderIconCallback}
                    changeFocus={changeTreeNodeBranchHeaderFocus}
                    animateTreeNodeContent={animateTreeNodeContent}
                    openNodeOn={openNodeOn}
                >
                    {bodyContent}
                </TreeNodeBranch>
            ))}
        </ul>
    );
}

export const enum TreeNodeState {
    COLLAPSED_WITH_JS = "COLLAPSED_WITH_JS",
    COLLAPSED_WITH_CSS = "COLLAPSED_WITH_CSS",
    EXPANDED = "EXPANDED",
    LOADING = "LOADING"
}
