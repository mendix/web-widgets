import classNames from "classnames";
import { ValueStatus } from "mendix";
import { ReactElement, useCallback, useMemo, useState } from "react";
import "./ui/TreeNodeV2.scss";
import { TreeNodeState } from "../common/TreeNodeState";
import { renderTreeNodeHeaderIcon, TreeNodeHeaderIcon } from "../v1/HeaderIcon";
import { useIncrementalTreeData } from "./hooks/useIncrementalTreeData";
import { useInfiniteTreeNodes } from "./hooks/useInfiniteTreeNode";
import { TreeNodeV2DataItem } from "./treeBuilder";
import { TreeNodeContainerProps } from "../../../typings/TreeNodeProps";

function renderRecursiveNode(
    node: TreeNodeV2DataItem,
    renderHeaderIcon: TreeNodeHeaderIcon,
    iconPlacement: TreeNodeContainerProps["showIcon"],
    onNodeClick: (node: TreeNodeV2DataItem) => void
): ReactElement {
    const hasChildren = node.children.length > 0;
    const isExpanded = node.treeNodeState === TreeNodeState.EXPANDED;

    return (
        <li key={node.id} className="widget-tree-node-branch" role="treeitem" tabIndex={0} aria-expanded={isExpanded}>
            <span
                className={classNames("widget-tree-node-branch-header", {
                    "widget-tree-node-branch-header-reversed": iconPlacement === "left"
                })}
                id={`${node.id}TreeNodeBranchHeader`}
                onClick={() => onNodeClick(node)}
            >
                <span className="widget-tree-node-branch-header-value">{node.title}</span>
                {hasChildren && iconPlacement !== "no" ? (
                    <span className="widget-tree-node-branch-header-icon-container">
                        {renderHeaderIcon(node.treeNodeState, iconPlacement)}
                    </span>
                ) : null}
            </span>
            {hasChildren ? (
                <div
                    className={classNames("widget-tree-node-body", "widget-tree-node-v2-body", {
                        "widget-tree-node-v2-body-collapsed": !isExpanded
                    })}
                    id={`${node.id}TreeNodeBranchBody`}
                >
                    <ul role="group">
                        {node.children.map(child =>
                            renderRecursiveNode(child, renderHeaderIcon, iconPlacement, onNodeClick)
                        )}
                    </ul>
                </div>
            ) : null}
        </li>
    );
}

export function TreeNodeV2(props: TreeNodeContainerProps): ReactElement {
    const { items, appendItems } = useInfiniteTreeNodes(props);
    const [, forceRender] = useState(0);

    const expandedIcon = props.expandedIcon?.status === ValueStatus.Available ? props.expandedIcon.value : undefined;
    const collapsedIcon = props.collapsedIcon?.status === ValueStatus.Available ? props.collapsedIcon.value : undefined;
    const showCustomIcon = Boolean(props.expandedIcon) || Boolean(props.collapsedIcon);
    const iconPlacement = props.showIcon;
    const animateIcon = props.animate && props.animateIcon;

    const renderHeaderIcon = useMemo<TreeNodeHeaderIcon>(
        () => (treeNodeState, placement) =>
            renderTreeNodeHeaderIcon(treeNodeState, placement, {
                animateIcon,
                collapsedIcon,
                expandedIcon,
                showCustomIcon
            }),
        [animateIcon, collapsedIcon, expandedIcon, showCustomIcon]
    );

    const treeConfig = useMemo(
        () => ({
            headerCaption: props.headerCaption,
            headerContent: props.headerContent,
            headerType: props.headerType,
            parentAssociation: props.parentAssociation
        }),
        [props.parentAssociation, props.headerType, props.headerCaption, props.headerContent]
    );

    const treeData = useIncrementalTreeData(items, treeConfig);
    const onNodeClick = useCallback(
        (node: TreeNodeV2DataItem) => {
            if (node.treeNodeState === TreeNodeState.EXPANDED) {
                node.treeNodeState = TreeNodeState.COLLAPSED_WITH_CSS;
                forceRender(version => version + 1);
                return;
            }

            node.treeNodeState = TreeNodeState.EXPANDED;
            appendItems(
                node.item,
                node.children.map(child => child.item)
            );
            forceRender(version => version + 1);
        },
        [appendItems]
    );

    return (
        <ul
            className={classNames("widget-tree-node", "widget-tree-node-v2", props.class)}
            style={props.style}
            data-focusindex={props.tabIndex || 0}
            role="tree"
        >
            {treeData.map(node => renderRecursiveNode(node, renderHeaderIcon, iconPlacement, onNodeClick))}
        </ul>
    );
}
