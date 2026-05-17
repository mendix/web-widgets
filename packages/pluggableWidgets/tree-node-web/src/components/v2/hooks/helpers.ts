import { ObjectItem } from "mendix";
import { ReactNode } from "react";
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
