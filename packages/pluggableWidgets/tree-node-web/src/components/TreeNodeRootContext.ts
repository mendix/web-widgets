import { ObjectItem, Option } from "mendix";
import { createContext } from "react";

export type TreeNodeGraph = {
    parentObject: ObjectItem | null;
    items: ObjectItem[];
};

export interface TreeNodeRootContextProps {
    rootId: string;
    fetchChildren: (item?: Option<ObjectItem>) => void;
    treeNodeItems?: Map<Option<string> | string, TreeNodeGraph>;
}

export const TreeNodeRootContext = createContext<TreeNodeRootContextProps>({
    rootId: Math.random().toString(36).substring(2, 15),
    treeNodeItems: new Map<Option<string> | string, TreeNodeGraph>(),
    fetchChildren: (_item?: Option<ObjectItem>) => null
});
