import { WebIcon, ObjectItem } from "mendix";
import {
    createElement,
    CSSProperties,
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
import classNames from "classnames";
import { OpenNodeOnEnum, ShowIconEnum, TreeNodeContainerProps } from "../../typings/TreeNodeProps";
import {
    TreeNodeBranchContextProps,
    TreeNodeBranchContext,
    useInformParentContextOfChildNodes
} from "./TreeNodeBranchContext";

import loadingCircleSvg from "../assets/loading-circle.svg";
import {
    TreeNodeFocusChangeHandler,
    useTreeNodeBranchKeyboardHandler,
    useTreeNodeFocusChangeHandler
} from "./hooks/TreeNodeAccessibility";
import { ChevronIcon, CustomHeaderIcon } from "./Icons";
import { useTreeNodeLazyLoading } from "./hooks/lazyLoading";
import { useAnimatedTreeNodeContentHeight } from "./hooks/useAnimatedHeight";

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

    const renderHeaderIcon = useCallback<TreeNodeBranchProps["renderHeaderIcon"]>(
        (treeNodeState, iconPlacement) => {
            if (treeNodeState === TreeNodeState.LOADING) {
                return <img src={loadingCircleSvg} className="widget-tree-node-loading-spinner" alt="" aria-hidden />;
            }
            const treeNodeIsExpanded = treeNodeState === TreeNodeState.EXPANDED;
            return showCustomIcon ? (
                <CustomHeaderIcon icon={treeNodeIsExpanded ? expandedIcon : collapsedIcon} />
            ) : (
                <ChevronIcon
                    className={classNames("widget-tree-node-branch-header-icon", {
                        "widget-tree-node-branch-header-icon-animated": animateIcon,
                        "widget-tree-node-branch-header-icon-collapsed-left":
                            !treeNodeIsExpanded && iconPlacement === "left",
                        "widget-tree-node-branch-header-icon-collapsed-right":
                            !treeNodeIsExpanded && iconPlacement === "right"
                    })}
                />
            );
        },
        [collapsedIcon, expandedIcon, showCustomIcon, animateIcon]
    );

    // Combination of useState + useCallback is necessary here over useRef because it needs to trigger an update in useInformParentContextOfChildNodes
    const [treeNodeElement, setTreeNodeElement] = useState<HTMLDivElement | null>(null);
    const updateTreeNodeElement = useCallback((node: any) => {
        if (node) {
            setTreeNodeElement(node);
        }
    }, []);

    const isInsideAnotherTreeNode = useCallback(() => {
        return treeNodeElement?.parentElement?.className.includes(treeNodeBranchUtils.bodyClassName) ?? false;
    }, [treeNodeElement]);

    useInformParentContextOfChildNodes(items, isInsideAnotherTreeNode);

    const changeTreeNodeBranchHeaderFocus = useTreeNodeFocusChangeHandler();

    if (!items) {
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
                    renderHeaderIcon={renderHeaderIcon}
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
interface TreeNodeBranchProps {
    id: TreeNodeItem["id"];
    isUserDefinedLeafNode: boolean;
    startExpanded: boolean;
    headerContent: ReactNode;
    openNodeOn: OpenNodeOnEnum;
    children: ReactNode;
    iconPlacement: ShowIconEnum;
    renderHeaderIcon: (treeNodeState: TreeNodeState, iconPlacement: Exclude<ShowIconEnum, "no">) => ReactNode;
    changeFocus: TreeNodeFocusChangeHandler;
    animateTreeNodeContent: boolean;
}

const treeNodeBranchUtils = {
    bodyClassName: "widget-tree-node-body",
    getHeaderId: (id: TreeNodeItem["id"]) => `${id}TreeNodeBranchHeader`,
    getBodyId: (id: TreeNodeItem["id"]) => `${id}TreeNodeBranchBody`
};

function getTreeNodeAccessibilityProps(isExpanded: boolean): HTMLAttributes<HTMLLIElement> {
    return {
        "aria-expanded": isExpanded,
        role: "treeitem",
        tabIndex: 0
    };
}

export const enum TreeNodeState {
    COLLAPSED_WITH_JS = "COLLAPSED_WITH_JS",
    COLLAPSED_WITH_CSS = "COLLAPSED_WITH_CSS",
    EXPANDED = "EXPANDED",
    LOADING = "LOADING"
}

function TreeNodeBranch(props: TreeNodeBranchProps): ReactElement {
    const { level: currentContextLevel } = useContext(TreeNodeBranchContext);
    const [treeNodeState, setTreeNodeState] = useState<TreeNodeState>(
        props.startExpanded ? TreeNodeState.EXPANDED : TreeNodeState.COLLAPSED_WITH_JS
    );
    const [isActualLeafNode, setIsActualLeafNode] = useState<boolean>(props.isUserDefinedLeafNode || !props.children);
    const isHeaderClickable = props.openNodeOn === "headerClick";
    const isIconClickable = props.openNodeOn === "iconClick";

    useEffect(() => {
        setIsActualLeafNode(props.isUserDefinedLeafNode || !props.children);
    }, [props.children]);

    const informParentOfChildNodes = useCallback<TreeNodeBranchContextProps["informParentOfChildNodes"]>(
        numberOfNodes => {
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
        },
        []
    );

    const treeNodeBranchBody = useRef<HTMLDivElement>(null);
    const treeNodeBranchRef = useRef<HTMLLIElement>(null);

    const { hasNestedTreeNode } = useTreeNodeLazyLoading(treeNodeBranchBody);
    const { isAnimating, captureElementHeight, animateTreeNodeContent, cleanupAnimation } =
        useAnimatedTreeNodeContentHeight(treeNodeBranchBody);

    useLayoutEffect(() => {
        if (props.animateTreeNodeContent && treeNodeState !== TreeNodeState.LOADING) {
            const animationCleanup = animateTreeNodeContent();
            if (animationCleanup) {
                return animationCleanup;
            }
        }
    }, [animateTreeNodeContent, props.animateTreeNodeContent, treeNodeState]);

    const eventTargetIsNotCurrentBranch = useCallback<(event: SyntheticEvent<HTMLElement>) => boolean>(event => {
        const target = event.target as Node;
        return (
            !treeNodeBranchRef.current?.isSameNode(target) &&
            !treeNodeBranchRef.current?.firstElementChild?.contains(target) &&
            !treeNodeBranchRef.current?.lastElementChild?.isSameNode(target)
        );
    }, []);

    useEffect(() => {
        if (treeNodeState === TreeNodeState.LOADING) {
            if (!hasNestedTreeNode()) {
                setTreeNodeState(TreeNodeState.EXPANDED);
            }
        }
    }, [hasNestedTreeNode, treeNodeState]);

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
        [isActualLeafNode, eventTargetIsNotCurrentBranch, captureElementHeight]
    );

    const treeNodeAccessibilityProps = getTreeNodeAccessibilityProps(treeNodeState === TreeNodeState.EXPANDED);

    const onHeaderKeyDown = useTreeNodeBranchKeyboardHandler(
        toggleTreeNodeContent,
        props.changeFocus,
        treeNodeState,
        isActualLeafNode,
        eventTargetIsNotCurrentBranch
    );

    const onIconClick = isIconClickable ? toggleTreeNodeContent : undefined;
    const onHeaderClick = isHeaderClickable ? toggleTreeNodeContent : undefined;

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
                    "widget-tree-node-branch-header-reversed": props.iconPlacement === "left"
                })}
                id={treeNodeBranchUtils.getHeaderId(props.id)}
                onClick={onHeaderClick}
            >
                <span className="widget-tree-node-branch-header-value">{props.headerContent}</span>
                {!isActualLeafNode && props.iconPlacement !== "no" && (
                    <span
                        className={classNames("widget-tree-node-branch-header-icon-container", {
                            "widget-tree-node-branch-header-clickable": !isActualLeafNode && isIconClickable
                        })}
                        onClick={onIconClick}
                    >
                        {props.renderHeaderIcon(treeNodeState, props.iconPlacement)}
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
                        id={treeNodeBranchUtils.getBodyId(props.id)}
                        aria-hidden={treeNodeState !== TreeNodeState.EXPANDED}
                        ref={treeNodeBranchBody}
                        onTransitionEnd={cleanupAnimation}
                    >
                        {props.children}
                    </div>
                </TreeNodeBranchContext.Provider>
            )}
        </li>
    );
}
