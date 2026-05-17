import classNames from "classnames";
import { WebIcon } from "mendix";
import { ReactNode } from "react";

import { ShowIconEnum } from "../../../typings/TreeNodeProps";
import loadingCircleSvg from "../../assets/loading-circle.svg";

import { ChevronIcon, CustomHeaderIcon } from "../v1/Icons";
import { TreeNodeState } from "./TreeNodeState";

export interface IconOptions {
    animateIcon: boolean;
    collapsedIcon?: WebIcon;
    expandedIcon?: WebIcon;
    showCustomIcon: boolean;
}

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
