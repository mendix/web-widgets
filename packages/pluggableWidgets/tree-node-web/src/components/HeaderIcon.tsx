import classNames from "classnames";
import { createElement, ReactNode } from "react";

import { ShowIconEnum } from "../../typings/TreeNodeProps";
import loadingCircleSvg from "../assets/loading-circle.svg";

import { ChevronIcon, CustomHeaderIcon } from "./Icons";
import { TreeNodeState, TreeNodeProps } from "./TreeNode";

export type IconOptions = Pick<TreeNodeProps, "animateIcon" | "collapsedIcon" | "expandedIcon" | "showCustomIcon">;

export type TreeNodeHeaderIcon = (
    treeNodeState: TreeNodeState,
    iconPlacement: Exclude<ShowIconEnum, "no">
) => ReactNode;

export function renderTreeNodeHeaderIcon(
    treeNodeState: TreeNodeState,
    iconPlacement: Exclude<ShowIconEnum, "no">,
    iconOptions: IconOptions
): ReactNode {
    if (treeNodeState === TreeNodeState.LOADING) {
        return <img src={loadingCircleSvg} className="widget-tree-node-loading-spinner" alt="" aria-hidden />;
    }

    const { animateIcon, collapsedIcon, expandedIcon, showCustomIcon } = iconOptions;
    const treeNodeIsExpanded = treeNodeState === TreeNodeState.EXPANDED;

    return showCustomIcon ? (
        <CustomHeaderIcon icon={treeNodeIsExpanded ? expandedIcon : collapsedIcon} />
    ) : (
        <ChevronIcon
            className={classNames("widget-tree-node-branch-header-icon", {
                "widget-tree-node-branch-header-icon-animated": animateIcon,
                "widget-tree-node-branch-header-icon-collapsed-left": !treeNodeIsExpanded && iconPlacement === "left",
                "widget-tree-node-branch-header-icon-collapsed-right": !treeNodeIsExpanded && iconPlacement === "right"
            })}
        />
    );
}
