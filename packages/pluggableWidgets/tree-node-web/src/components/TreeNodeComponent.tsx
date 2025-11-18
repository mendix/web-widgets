import classNames from "classnames";
import { ObjectItem, WebIcon } from "mendix";
import { ReactElement, useCallback } from "react";

import { TreeNodeContainerProps } from "../../typings/TreeNodeProps";

import { renderTreeNodeHeaderIcon, TreeNodeHeaderIcon } from "./HeaderIcon";
import { useTreeNodeFocusChangeHandler } from "./hooks/TreeNodeAccessibility";
import { useTreeNodeRef } from "./hooks/useTreeNodeRef";
import { TreeNodeBranch, treeNodeBranchUtils } from "./TreeNodeBranch";
import { useInformParentContextOfChildNodes } from "./TreeNodeBranchContext";
import { TreeNodeRoot } from "./TreeNodeRoot";

export interface TreeNodeComponentProps
    extends Pick<
        TreeNodeContainerProps,
        | "tabIndex"
        | "class"
        | "style"
        | "hasChildren"
        | "startExpanded"
        | "showIcon"
        | "animate"
        | "animateIcon"
        | "openNodeOn"
        | "headerType"
        | "headerCaption"
        | "headerContent"
        | "children"
    > {
    items: ObjectItem[] | null;
    showCustomIcon: boolean;
    expandedIcon?: WebIcon;
    collapsedIcon?: WebIcon;
    level: number;
    isInfiniteMode: boolean;
}

export function TreeNodeComponent(props: TreeNodeComponentProps): ReactElement | null {
    const {
        class: className,
        tabIndex,
        style,
        items,
        hasChildren,
        startExpanded,
        showIcon,
        animate,
        animateIcon,
        openNodeOn,
        headerType,
        headerCaption,
        headerContent,
        children,
        showCustomIcon,
        expandedIcon,
        collapsedIcon,
        level,
        isInfiniteMode
    } = props;
    const [treeNodeElement, updateTreeNodeElement] = useTreeNodeRef();
    const isUserDefinedLeafNode = hasChildren === false;
    const showIconAnimation = animate && animateIcon;

    const renderHeaderIconCallback = useCallback<TreeNodeHeaderIcon>(
        (treeNodeState, iconPlacement) =>
            renderTreeNodeHeaderIcon(treeNodeState, iconPlacement, {
                animateIcon: showIconAnimation,
                collapsedIcon,
                expandedIcon,
                showCustomIcon
            }),
        [collapsedIcon, expandedIcon, showCustomIcon, showIconAnimation]
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
            {items.map((item, _idx) => (
                <TreeNodeBranch
                    key={item.id}
                    id={item.id}
                    headerContent={headerType === "text" ? headerCaption?.get(item).value : headerContent?.get(item)}
                    isUserDefinedLeafNode={isUserDefinedLeafNode}
                    startExpanded={startExpanded}
                    iconPlacement={showIcon}
                    renderHeaderIcon={renderHeaderIconCallback}
                    changeFocus={changeTreeNodeBranchHeaderFocus}
                    animateTreeNodeContent={animate}
                    openNodeOn={openNodeOn}
                    item={item}
                    level={level}
                >
                    {children?.get(item)}
                    {isInfiniteMode && <TreeNodeRoot {...props}></TreeNodeRoot>}
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
