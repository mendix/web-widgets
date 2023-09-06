import { parseStyle } from "@mendix/widget-plugin-platform/preview/parse-style";
import { mapPreviewIconToWebIcon } from "@mendix/widget-plugin-platform/preview/map-icon";
import { GUID } from "mendix";
import { createElement, ReactElement } from "react";
import { TreeNodePreviewProps } from "../typings/TreeNodeProps";
import { TreeNode } from "./components/TreeNode";

function renderTextTemplateWithFallback(textTemplateValue: string, placeholder: string): string {
    if (textTemplateValue.trim().length === 0) {
        return placeholder;
    }
    return textTemplateValue;
}

export function preview(props: TreeNodePreviewProps): ReactElement | null {
    return (
        <TreeNode
            class={props.className}
            style={parseStyle(props.style)}
            items={[
                {
                    id: "1" as GUID,
                    headerContent:
                        props.headerType === "text" ? (
                            renderTextTemplateWithFallback(props.headerCaption, "[No header caption configured]")
                        ) : (
                            <props.headerContent.renderer caption="Place header contents here.">
                                <div />
                            </props.headerContent.renderer>
                        ),
                    bodyContent: (
                        <props.children.renderer caption="Place other tree nodes here.">
                            <div />
                        </props.children.renderer>
                    )
                }
            ]}
            isUserDefinedLeafNode={!props.hasChildren}
            startExpanded
            showCustomIcon={Boolean(props.expandedIcon) || Boolean(props.collapsedIcon)}
            iconPlacement={props.showIcon}
            collapsedIcon={mapPreviewIconToWebIcon(props.collapsedIcon)}
            expandedIcon={mapPreviewIconToWebIcon(props.expandedIcon)}
            animateIcon={false}
            animateTreeNodeContent={false}
            openNodeOn={"headerClick"}
        />
    );
}
