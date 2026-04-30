import { ReactElement } from "react";
import { TreeNodeContainerProps } from "../typings/TreeNodeProps";
import { TreeNodeV1 } from "./components/v1/Root";
import { TreeNodeV2 } from "./components/v2/TreeNode";

export function TreeNode(props: TreeNodeContainerProps): ReactElement {
    if (props.parentAssociation) {
        return <TreeNodeV2 {...props} />;
    } else {
        return <TreeNodeV1 {...props} />;
    }
}
