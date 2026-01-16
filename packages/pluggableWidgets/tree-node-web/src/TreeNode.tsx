import { ObjectItem, ValueStatus } from "mendix";
import { ReactElement, useEffect, useState } from "react";
import { TreeNodeContainerProps } from "../typings/TreeNodeProps";
import { InfoTreeNodeItem, TreeNode as TreeNodeComponent, TreeNodeItem } from "./components/TreeNode";

function mapDataSourceItemToTreeNodeItem(item: ObjectItem, props: TreeNodeContainerProps): TreeNodeItem {
    return {
        id: item.id,
        headerContent:
            props.headerType === "text" ? props.headerCaption?.get(item).value : props.headerContent?.get(item),
        bodyContent: props.children?.get(item),
        isUserDefinedLeafNode: props.hasChildren?.get(item).value === false
    };
}

export function TreeNode(props: TreeNodeContainerProps): ReactElement {
    const { datasource } = props;
    const [treeNodeItems, setTreeNodeItems] = useState<TreeNodeItem[] | InfoTreeNodeItem | null>([]);

    useEffect(() => {
        // only get the items when datasource is actually available
        // this is to prevent treenode resetting it's render while datasource is loading.
        if (datasource.status === ValueStatus.Available) {
            if (datasource.items && datasource.items.length) {
                setTreeNodeItems(datasource.items.map(item => mapDataSourceItemToTreeNodeItem(item, props)));
            } else {
                setTreeNodeItems({
                    Message: "No data available"
                });
            }
        }
    }, [datasource.status, datasource.items]);
    const expandedIcon = props.expandedIcon?.status === ValueStatus.Available ? props.expandedIcon.value : undefined;
    const collapsedIcon = props.collapsedIcon?.status === ValueStatus.Available ? props.collapsedIcon.value : undefined;

    return (
        <TreeNodeComponent
            class={props.class}
            style={props.style}
            items={treeNodeItems}
            startExpanded={props.startExpanded}
            showCustomIcon={Boolean(props.expandedIcon) || Boolean(props.collapsedIcon)}
            iconPlacement={props.showIcon}
            expandedIcon={expandedIcon}
            collapsedIcon={collapsedIcon}
            tabIndex={props.tabIndex}
            animateIcon={props.animate && props.animateIcon}
            animateTreeNodeContent={props.animate}
            openNodeOn={props.openNodeOn}
        />
    );
}
