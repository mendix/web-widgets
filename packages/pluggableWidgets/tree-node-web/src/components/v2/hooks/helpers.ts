import { ObjectItem } from "mendix";
import { ReactNode, KeyboardEvent } from "react";
import { TreeConfigRef, TreeNodeV2DataItem } from "./useIncrementalTreeData";
import { TreeNodeState } from "../../common/TreeNodeState";
import { TreeNodeContainerProps } from "../../../../typings/TreeNodeProps";

export function getItemId(item: ObjectItem): string {
    return String(item.id);
}

export function getParentId(
    item: ObjectItem,
    parentAssociation: TreeNodeContainerProps["parentAssociation"]
): string | undefined {
    const parentObject = parentAssociation?.get(item).value;
    return parentObject?.id ? getItemId(parentObject) : undefined;
}

export function getItemTitle(item: ObjectItem, config: TreeConfigRef): ReactNode {
    if (config.headerType === "text") {
        return config.headerCaption?.get(item).value ?? getItemId(item);
    }
    return config.headerContent?.get(item) ?? getItemId(item);
}

export function isConfigChanged(previous: TreeConfigRef | null, next: TreeConfigRef): boolean {
    if (!previous) {
        return true;
    }

    return (
        previous.headerType !== next.headerType ||
        previous.headerCaption !== next.headerCaption ||
        previous.headerContent !== next.headerContent ||
        previous.parentAssociation !== next.parentAssociation
    );
}

/**
 * The parent ids whose children the datasource has to deliver for the tree to be renderable and
 * correct: every node the widget currently renders, plus one level past it so a node's own expand
 * affordance is already known before the expand that reveals it lands.
 *
 * Derived from the tree as it stands — deliberately not from a record of what has been fetched
 * before. A node only starts a chain here when it has no parent at all; an orphan (its parent
 * exists but the datasource does not deliver it) is promoted to root level for rendering, but is
 * not a root for retrieval. See `design.md` D6.
 *
 * Recursion continues through `COLLAPSED_WITH_CSS` as well as `EXPANDED`: that state means the
 * node was opened and then closed, so its subtree is still rendered (hidden by CSS) and still has
 * to be kept correct. `COLLAPSED_WITH_JS` stops it — that body was never rendered.
 */
export function deriveDesiredParentIds(treeData: TreeNodeV2DataItem[], deliveredIds: Set<string>): string[] {
    const desiredIds: string[] = [];
    const seen = new Set<string>();

    const add = (node: TreeNodeV2DataItem): void => {
        if (seen.has(node.id) || !deliveredIds.has(node.id)) {
            return;
        }
        seen.add(node.id);
        desiredIds.push(node.id);
    };

    const isSubtreeRendered = (node: TreeNodeV2DataItem): boolean =>
        node.treeNodeState === TreeNodeState.EXPANDED || node.treeNodeState === TreeNodeState.COLLAPSED_WITH_CSS;

    // Breadth-first over the rendered part of the tree. Order is incidental — the caller turns this
    // into an `or` of equalities, which is a set.
    let level = treeData.filter(node => node.parentId === undefined);

    while (level.length > 0) {
        const nextLevel: TreeNodeV2DataItem[] = [];

        for (const node of level) {
            add(node);

            for (const child of node.children) {
                add(child);

                if (isSubtreeRendered(node)) {
                    nextLevel.push(child);
                }
            }
        }

        level = nextLevel;
    }

    return desiredIds;
}

export function onKeyDownHandler<T>(
    event: KeyboardEvent<HTMLLIElement>,
    hasChildren: boolean,
    isExpanded: boolean,
    onNodeClick: (node: T) => void,
    node: T
): void {
    // Only handle key events on the tree item itself, not bubbled from children
    if (event.currentTarget !== event.target) {
        return;
    }

    switch (event.key) {
        case "Enter":
        case " ": // Space key
            if (hasChildren) {
                event.preventDefault();
                event.stopPropagation();
                onNodeClick(node);
            }
            break;
        case "ArrowRight":
            if (hasChildren) {
                if (!isExpanded) {
                    event.preventDefault();
                    event.stopPropagation();
                    onNodeClick(node);
                }
            }
            break;
        case "ArrowLeft":
            if (hasChildren && isExpanded) {
                event.preventDefault();
                event.stopPropagation();
                onNodeClick(node);
            }
            break;
    }
}
