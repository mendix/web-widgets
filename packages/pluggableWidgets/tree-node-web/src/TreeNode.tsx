import { createElement, ReactElement } from "react";
import { ObjectItem, ValueStatus } from "mendix";
import { TreeNodeContainerProps } from "../typings/TreeNodeProps";
import { TreeNode as TreeNodeComponent, TreeNodeItem } from "./components/TreeNode";

function mapDataSourceItemToTreeNodeItem(item: ObjectItem, props: TreeNodeContainerProps): TreeNodeItem {
    return {
        id: item.id,
        headerContent:
            props.headerType === "text" ? props.headerCaption?.get(item).value : props.headerContent?.get(item),
        bodyContent: props.children?.get(item)
    };
}

export function TreeNode(props: TreeNodeContainerProps): ReactElement {
    // TODO: Handle async states more gracefully?
    const items =
        props.datasource.status === ValueStatus.Available
            ? props.datasource.items?.map(item => mapDataSourceItemToTreeNodeItem(item, props)) ?? []
            : null;

    const expandedIcon = props.expandedIcon?.status === ValueStatus.Available ? props.expandedIcon.value : undefined;
    const collapsedIcon = props.collapsedIcon?.status === ValueStatus.Available ? props.collapsedIcon.value : undefined;

    return (
        <TreeNodeComponent
            class={props.class}
            style={props.style}
            items={items}
            isUserDefinedLeafNode={!props.hasChildren}
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
