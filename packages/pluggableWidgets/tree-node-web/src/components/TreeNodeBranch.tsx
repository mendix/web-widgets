import classNames from "classnames";
import {
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
import { ObjectItem, Option } from "mendix";

import { OpenNodeOnEnum, ShowIconEnum } from "../../typings/TreeNodeProps";

import { useTreeNodeLazyLoading } from "./hooks/lazyLoading";
import { useAnimatedTreeNodeContentHeight } from "./hooks/useAnimatedHeight";
import { TreeNodeFocusChangeHandler, useTreeNodeBranchKeyboardHandler } from "./hooks/TreeNodeAccessibility";

import { TreeNodeHeaderIcon } from "./HeaderIcon";
import { TreeNode as TreeNodeComponent, TreeNodeItem, TreeNodeProps, TreeNodeState } from "./TreeNode";
import { TreeNodeBranchContext, TreeNodeBranchContextProps } from "./TreeNodeBranchContext";

export interface TreeNodeBranchProps {
    item: TreeNodeItem;
    animateTreeNodeContent: boolean;
    children: ReactNode;
    iconPlacement: ShowIconEnum;
    openNodeOn: OpenNodeOnEnum;
    startExpanded: boolean;
    changeFocus: TreeNodeFocusChangeHandler;
    renderHeaderIcon: TreeNodeHeaderIcon;
    fetchChildren: (item?: Option<ObjectItem>) => Promise<TreeNodeItem[]>;
    appendChildren: (items: TreeNodeItem[], parent: TreeNodeItem) => void;
    treeNodeProps: TreeNodeProps;
    isInfiniteTreeNodesEnabled: boolean;
}

export const treeNodeBranchUtils = {
    bodyClassName: "widget-tree-node-body",
    getHeaderId: (id: TreeNodeItem["id"]) => `${id}TreeNodeBranchHeader`,
    getBodyId: (id: TreeNodeItem["id"]) => `${id}TreeNodeBranchBody`
};

export function TreeNodeBranch({
    item,
    animateTreeNodeContent: animateTreeNodeContentProp,
    changeFocus,
    children,
    iconPlacement,
    openNodeOn,
    renderHeaderIcon,
    startExpanded,
    fetchChildren,
    appendChildren,
    isInfiniteTreeNodesEnabled,
    treeNodeProps
}: TreeNodeBranchProps): ReactElement {
    const { level: currentContextLevel } = useContext(TreeNodeBranchContext);
    const { id, headerContent, isUserDefinedLeafNode } = item;

    const treeNodeBranchRef = useRef<HTMLLIElement>(null);
    const treeNodeBranchBody = useRef<HTMLDivElement>(null);

    const [isActualLeafNode, setIsActualLeafNode] = useState<boolean>(
        isUserDefinedLeafNode || (!children && !isInfiniteTreeNodesEnabled)
    );
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

    const updateTreeNodeState = useCallback(() => {
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
    }, []);

    const toggleTreeNodeContent = useCallback<ReactEventHandler<HTMLElement>>(
        event => {
            if (eventTargetIsNotCurrentBranch(event)) {
                return;
            }

            // load children for infinite tree nodes
            if (isInfiniteTreeNodesEnabled) {
                fetchChildren(item).then(result => {
                    if (Array.isArray(result) && result.length > 0) {
                        // append children to the localized item
                        appendChildren(result, item);
                    } else {
                        setIsActualLeafNode(true);
                    }
                });
            }

            if (!isActualLeafNode) {
                captureElementHeight();
                updateTreeNodeState();
            }
        },
        [
            captureElementHeight,
            eventTargetIsNotCurrentBranch,
            isActualLeafNode,
            updateTreeNodeState,
            fetchChildren,
            item,
            isInfiniteTreeNodesEnabled,
            appendChildren
        ]
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
        setIsActualLeafNode(isUserDefinedLeafNode || (!children && !isInfiniteTreeNodesEnabled));
    }, [children, isUserDefinedLeafNode, isInfiniteTreeNodesEnabled]);

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
                        {isInfiniteTreeNodesEnabled && item.children && item.children.length > 0 ? (
                            <TreeNodeComponent {...treeNodeProps} items={item.children || []} />
                        ) : (
                            children
                        )}
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
