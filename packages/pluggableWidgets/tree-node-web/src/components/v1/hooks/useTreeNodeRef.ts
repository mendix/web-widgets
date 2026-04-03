import { useCallback, useState } from "react";

type TreeNodeElement = HTMLDivElement | HTMLUListElement | null;
type UpdateRef = (node: TreeNodeElement) => void;

export function useTreeNodeRef(): [TreeNodeElement, UpdateRef] {
    // Combination of useState + useCallback is necessary here over useRef because it needs to trigger an update in useInformParentContextOfChildNodes
    const [treeNodeElement, setTreeNodeElement] = useState<TreeNodeElement>(null);
    const updateTreeNodeElement = useCallback((node: TreeNodeElement) => {
        if (node) {
            setTreeNodeElement(node);
        }
    }, []);

    return [treeNodeElement, updateTreeNodeElement];
}
