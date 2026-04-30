import { ObjectItem } from "mendix";
import { ReactNode, useEffect, useRef, useState } from "react";
import { TreeNodeContainerProps } from "../../../../typings/TreeNodeProps";
import { TreeNodeState } from "../../common/TreeNodeState";
import { getItemId, getItemTitle, getParentId, isConfigChanged } from "./helpers";

type NodePlacement = string | null;

export interface TreeConfigRef {
    headerCaption: TreeNodeContainerProps["headerCaption"];
    headerContent: TreeNodeContainerProps["headerContent"];
    headerType: TreeNodeContainerProps["headerType"];
    parentAssociation: TreeNodeContainerProps["parentAssociation"];
    startExpanded: TreeNodeContainerProps["startExpanded"];
}

export interface TreeNodeV2DataItem {
    children: TreeNodeV2DataItem[];
    id: string;
    item: ObjectItem;
    parentId?: string;
    treeNodeState: TreeNodeState;
    title: ReactNode;
}

export function useIncrementalTreeData(items: ObjectItem[] | undefined, config: TreeConfigRef): TreeNodeV2DataItem[] {
    const [treeData, setTreeData] = useState<TreeNodeV2DataItem[]>([]);

    const rootsRef = useRef<TreeNodeV2DataItem[]>([]);
    const nodesByIdRef = useRef<Map<string, TreeNodeV2DataItem>>(new Map());
    const placementByIdRef = useRef<Map<string, NodePlacement>>(new Map());
    const previousIdsRef = useRef<Set<string>>(new Set());
    const previousConfigRef = useRef<TreeConfigRef | null>(null);

    useEffect(() => {
        const sourceItems = items ?? [];
        const incomingIds = new Set<string>(sourceItems.map(getItemId));

        const removedIdsDetected =
            incomingIds.size < previousIdsRef.current.size ||
            [...previousIdsRef.current].some(id => !incomingIds.has(id));

        const configChanged = isConfigChanged(previousConfigRef.current, config);
        previousConfigRef.current = config;

        if (configChanged || removedIdsDetected) {
            rootsRef.current = [];
            nodesByIdRef.current.clear();
            placementByIdRef.current.clear();
        }

        const removeFromCurrentPlacement = (nodeId: string): void => {
            const placement = placementByIdRef.current.get(nodeId);

            if (placement === undefined) {
                return;
            }

            if (placement === null) {
                rootsRef.current = rootsRef.current.filter(node => node.id !== nodeId);
                return;
            }

            const parent = nodesByIdRef.current.get(placement);
            if (parent) {
                parent.children = parent.children.filter(child => child.id !== nodeId);
            }
        };

        const placeNode = (node: TreeNodeV2DataItem): void => {
            const parentId = node.parentId && node.parentId !== node.id ? node.parentId : undefined;

            if (parentId) {
                const parent = nodesByIdRef.current.get(parentId);

                if (parent) {
                    if (placementByIdRef.current.get(node.id) === parentId) {
                        return;
                    }

                    removeFromCurrentPlacement(node.id);
                    parent.children.push(node);
                    placementByIdRef.current.set(node.id, parentId);
                    return;
                }
            }

            if (placementByIdRef.current.get(node.id) === null) {
                return;
            }

            removeFromCurrentPlacement(node.id);
            rootsRef.current.push(node);
            placementByIdRef.current.set(node.id, null);
        };

        for (const item of sourceItems) {
            const nodeId = getItemId(item);
            const nextParentId = getParentId(item, config.parentAssociation);
            const nextTitle = getItemTitle(item, config);

            const existingNode = nodesByIdRef.current.get(nodeId);
            // if already exists, update the item
            if (existingNode) {
                const parentChanged = existingNode.parentId !== nextParentId;
                existingNode.item = item;
                existingNode.parentId = nextParentId;
                existingNode.title = nextTitle;

                if (parentChanged) {
                    placeNode(existingNode);
                }
                continue;
            }

            const newNode: TreeNodeV2DataItem = {
                children: [],
                id: nodeId,
                item,
                parentId: nextParentId,
                treeNodeState: config.startExpanded ? TreeNodeState.EXPANDED : TreeNodeState.COLLAPSED_WITH_JS,
                title: nextTitle
            };

            nodesByIdRef.current.set(nodeId, newNode);
            placeNode(newNode);

            // Re-place potential children that were temporarily roots while parent wasn't loaded yet.
            for (const candidate of nodesByIdRef.current.values()) {
                if (candidate.parentId === nodeId && candidate.id !== nodeId) {
                    placeNode(candidate);
                }
            }
        }

        previousIdsRef.current = incomingIds;
        setTreeData([...rootsRef.current]);
    }, [items, config]);

    return treeData;
}
