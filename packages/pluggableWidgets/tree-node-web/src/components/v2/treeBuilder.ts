import { ObjectItem } from "mendix";
import { ReactNode } from "react";
import { TreeNodeContainerProps } from "../../../typings/TreeNodeProps";
import { TreeNodeState } from "../common/TreeNodeState";

export interface TreeNodeV2DataItem {
    children: TreeNodeV2DataItem[];
    id: string;
    item: ObjectItem;
    parentId?: string;
    treeNodeState: TreeNodeState;
    title: ReactNode;
}

export interface TreeNodeBuildConfig {
    headerCaption: TreeNodeContainerProps["headerCaption"];
    headerContent: TreeNodeContainerProps["headerContent"];
    headerType: TreeNodeContainerProps["headerType"];
    parentAssociation: TreeNodeContainerProps["parentAssociation"];
}

function getItemId(item: ObjectItem): string {
    return String(item.id);
}

function getParentId(
    item: ObjectItem,
    parentAssociation: TreeNodeBuildConfig["parentAssociation"]
): string | undefined {
    const parentObject = parentAssociation?.get(item).value;
    return parentObject?.id ? String(parentObject.id) : undefined;
}

function getItemTitle(item: ObjectItem, config: TreeNodeBuildConfig): ReactNode {
    if (config.headerType === "text") {
        return config.headerCaption?.get(item).value ?? String(item.id);
    }
    return config.headerContent?.get(item) ?? String(item.id);
}

export function buildTree(items: ObjectItem[], config: TreeNodeBuildConfig): TreeNodeV2DataItem[] {
    const nodes = items.map<TreeNodeV2DataItem>(item => ({
        children: [],
        id: getItemId(item),
        item,
        parentId: getParentId(item, config.parentAssociation),
        treeNodeState: TreeNodeState.COLLAPSED_WITH_JS,
        title: getItemTitle(item, config)
    }));

    const nodeMap = new Map<string, TreeNodeV2DataItem>();
    nodes.forEach(node => {
        nodeMap.set(node.id, node);
    });

    const roots: TreeNodeV2DataItem[] = [];
    nodes.forEach(node => {
        if (!node.parentId || node.parentId === node.id) {
            roots.push(node);
            return;
        }

        const parentNode = nodeMap.get(node.parentId);
        if (parentNode) {
            parentNode.children.push(node);
        } else {
            roots.push(node);
        }
    });

    return roots;
}
