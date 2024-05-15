import classNames from "classnames";
import {
    createElement,
    HTMLAttributes,
    ReactElement,
    ReactEventHandler,
    ReactNode,
    SyntheticEvent,
    useCallback,
    useContext,
    useEffect,
    useLayoutEffect,
    useRef,
    useState
} from "react";

import { OpenNodeOnEnum, ShowIconEnum } from "../../typings/TreeNodeProps";

import { useTreeNodeLazyLoading } from "./hooks/lazyLoading";
import { useAnimatedTreeNodeContentHeight } from "./hooks/useAnimatedHeight";
import { TreeNodeFocusChangeHandler, useTreeNodeBranchKeyboardHandler } from "./hooks/TreeNodeAccessibility";

import { TreeNodeHeaderIcon } from "./HeaderIcon";
import { TreeNodeItem, TreeNodeState } from "./TreeNode";
import { TreeNodeBranchContextProps, TreeNodeBranchContext } from "./TreeNodeBranchContext";

export interface TreeNodeBranchProps {
    animateTreeNodeContent: boolean;
    children: ReactNode;
    headerContent: ReactNode;
    iconPlacement: ShowIconEnum;
    id: TreeNodeItem["id"];
    isUserDefinedLeafNode: boolean;
    openNodeOn: OpenNodeOnEnum;
    startExpanded: boolean;
    changeFocus: TreeNodeFocusChangeHandler;
    renderHeaderIcon: TreeNodeHeaderIcon;
}

export const treeNodeBranchUtils = {
    bodyClassName: "widget-tree-node-body",
    getHeaderId: (id: TreeNodeItem["id"]) => `${id}TreeNodeBranchHeader`,
    getBodyId: (id: TreeNodeItem["id"]) => `${id}TreeNodeBranchBody`
};

export function TreeNodeBranch({
    animateTreeNodeContent: animateTreeNodeContentProp,
    changeFocus,
    children,
    headerContent,
    iconPlacement,
    id,
    isUserDefinedLeafNode,
    openNodeOn,
    renderHeaderIcon,
    startExpanded
}: TreeNodeBranchProps): ReactElement {
    const { level: currentContextLevel } = useContext(TreeNodeBranchContext);

    const treeNodeBranchRef = useRef<HTMLLIElement>(null);
    const treeNodeBranchBody = useRef<HTMLDivElement>(null);

    const [isActualLeafNode, setIsActualLeafNode] = useState<boolean>(isUserDefinedLeafNode || !children);
    const [treeNodeState, setTreeNodeState] = useState<TreeNodeState>(
        startExpanded ? TreeNodeState.EXPANDED : TreeNodeState.COLLAPSED_WITH_JS
    );

    const { isAnimating, captureElementHeight, animateTreeNodeContent, cleanupAnimation } =
        useAnimatedTreeNodeContentHeight(treeNodeBranchBody);

    const informParentOfChildNodes: TreeNodeBranchContextProps["informParentOfChildNodes"] = numberOfNodes => {
        if (numberOfNodes !== undefined) {
            setTreeNodeState(treeNodeState =>
                treeNodeState === TreeNodeState.LOADING ? TreeNodeState.EXPANDED : treeNodeState
            );
            setIsActualLeafNode(currentIsActualLeafNode => {
                if (numberOfNodes === 0 && !currentIsActualLeafNode) {
                    return true;
                } else if (numberOfNodes > 0 && currentIsActualLeafNode) {
                    return false;
                }
                return currentIsActualLeafNode;
            });
        }
    };

    const eventTargetIsNotCurrentBranch = useCallback<(event: SyntheticEvent<HTMLElement>) => boolean>(event => {
        const target = event.target as Node;
        return (
            !treeNodeBranchRef.current?.isSameNode(target) &&
            !treeNodeBranchRef.current?.firstElementChild?.contains(target) &&
            !treeNodeBranchRef.current?.lastElementChild?.isSameNode(target)
        );
    }, []);

    const toggleTreeNodeContent = useCallback<ReactEventHandler<HTMLElement>>(
        event => {
            if (eventTargetIsNotCurrentBranch(event)) {
                return;
            }

            if (!isActualLeafNode) {
                captureElementHeight();
                setTreeNodeState(treeNodeState => {
                    if (treeNodeState === TreeNodeState.LOADING) {
                        // TODO:
                        return treeNodeState;
                    }
                    if (treeNodeState === TreeNodeState.COLLAPSED_WITH_JS) {
                        return TreeNodeState.LOADING;
                    }
                    if (treeNodeState === TreeNodeState.COLLAPSED_WITH_CSS) {
                        return TreeNodeState.EXPANDED;
                    }
                    return TreeNodeState.COLLAPSED_WITH_CSS;
                });
            }
        },
        [captureElementHeight, eventTargetIsNotCurrentBranch, isActualLeafNode]
    );

    const onHeaderKeyDown = useTreeNodeBranchKeyboardHandler(
        toggleTreeNodeContent,
        changeFocus,
        treeNodeState,
        isActualLeafNode,
        eventTargetIsNotCurrentBranch
    );

    const treeNodeAccessibilityProps = getTreeNodeAccessibilityProps(treeNodeState === TreeNodeState.EXPANDED);
    const isIconClickable = openNodeOn === "iconClick";
    const isHeaderClickable = openNodeOn === "headerClick";
    const onIconClick = isIconClickable ? toggleTreeNodeContent : undefined;
    const onHeaderClick = isHeaderClickable ? toggleTreeNodeContent : undefined;
    const { hasNestedTreeNode } = useTreeNodeLazyLoading(treeNodeBranchBody);

    useLayoutEffect(() => {
        if (animateTreeNodeContentProp && treeNodeState !== TreeNodeState.LOADING) {
            const animationCleanup = animateTreeNodeContent();
            if (animationCleanup) {
                return animationCleanup;
            }
        }
    }, [animateTreeNodeContent, animateTreeNodeContentProp, treeNodeState]);

    useEffect(() => {
        setIsActualLeafNode(isUserDefinedLeafNode || !children);
    }, [children, isUserDefinedLeafNode]);

    useEffect(() => {
        if (treeNodeState === TreeNodeState.LOADING) {
            if (!hasNestedTreeNode()) {
                setTreeNodeState(TreeNodeState.EXPANDED);
            }
        }
    }, [hasNestedTreeNode, treeNodeState]);

    return (
        <li
            className="widget-tree-node-branch"
            onKeyDown={onHeaderKeyDown}
            ref={treeNodeBranchRef}
            {...treeNodeAccessibilityProps}
        >
            <span
                className={classNames("widget-tree-node-branch-header", {
                    "widget-tree-node-branch-header-clickable": !isActualLeafNode && isHeaderClickable,
                    "widget-tree-node-branch-header-reversed": iconPlacement === "left"
                })}
                id={treeNodeBranchUtils.getHeaderId(id)}
                onClick={onHeaderClick}
            >
                <span className="widget-tree-node-branch-header-value">{headerContent}</span>
                {!isActualLeafNode && iconPlacement !== "no" && (
                    <span
                        className={classNames("widget-tree-node-branch-header-icon-container", {
                            "widget-tree-node-branch-header-clickable": !isActualLeafNode && isIconClickable
                        })}
                        onClick={onIconClick}
                    >
                        {renderHeaderIcon(treeNodeState, iconPlacement)}
                    </span>
                )}
            </span>
            {((!isActualLeafNode && treeNodeState !== TreeNodeState.COLLAPSED_WITH_JS) || isAnimating) && (
                <TreeNodeBranchContext.Provider
                    value={{
                        level: currentContextLevel + 1,
                        informParentOfChildNodes
                    }}
                >
                    <div
                        className={classNames(treeNodeBranchUtils.bodyClassName, {
                            "widget-tree-node-branch-hidden":
                                treeNodeState === TreeNodeState.COLLAPSED_WITH_CSS && !isAnimating,
                            "widget-tree-node-branch-loading": treeNodeState === TreeNodeState.LOADING
                        })}
                        id={treeNodeBranchUtils.getBodyId(id)}
                        aria-hidden={treeNodeState !== TreeNodeState.EXPANDED}
                        ref={treeNodeBranchBody}
                        onTransitionEnd={cleanupAnimation}
                    >
                        {children}
                    </div>
                </TreeNodeBranchContext.Provider>
            )}
        </li>
    );
}

function getTreeNodeAccessibilityProps(isExpanded: boolean): HTMLAttributes<HTMLLIElement> {
    return {
        "aria-expanded": isExpanded,
        role: "treeitem",
        tabIndex: 0
    };
}
