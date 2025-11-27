import { ObjectItem } from "mendix";
import { createContext, useContext, useEffect } from "react";

export interface TreeNodeBranchContextProps {
    parent?: ObjectItem;
    level: number;
    informParentOfChildNodes: (numberOfNodes: number | undefined) => void;
}

export const TreeNodeBranchContext = createContext<TreeNodeBranchContextProps>({
    parent: undefined,
    level: 0,
    informParentOfChildNodes: () => null
});

export const useInformParentContextOfChildNodes = (
    numberOfNodes: number,
    identifyParentIsTreeNode: () => boolean
): void => {
    const { level, informParentOfChildNodes } = useContext(TreeNodeBranchContext);

    useEffect(() => {
        if (level > 0 && identifyParentIsTreeNode()) {
            informParentOfChildNodes(numberOfNodes);
        }
    }, [identifyParentIsTreeNode, informParentOfChildNodes, level, numberOfNodes]);
};
