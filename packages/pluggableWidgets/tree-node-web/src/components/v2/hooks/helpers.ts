import { ObjectItem } from "mendix";
import { ReactNode, KeyboardEvent } from "react";
import { TreeConfigRef } from "./useIncrementalTreeData";
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
