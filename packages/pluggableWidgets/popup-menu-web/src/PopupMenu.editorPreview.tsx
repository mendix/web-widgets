import { parseStyle } from "@mendix/widget-plugin-platform/preview/parse-style";
import { createElement, ReactElement } from "react";
import { PopupMenu as PopupMenuComponent } from "./components/PopupMenu";

import { BasicItemsType, CustomItemsType, PopupMenuPreviewProps } from "../typings/PopupMenuProps";
import { dynamicValue } from "./utils/attrValue";

export function getPreviewCss(): string {
    return require("./ui/PopupMenuPreview.scss");
}

export function preview(props: PopupMenuPreviewProps): ReactElement {
    const basicItems: BasicItemsType[] = [];
    const customItems: CustomItemsType[] = [];
    const styles = parseStyle(props.style);

    if (!props.advancedMode) {
        props.basicItems.forEach(item => {
            basicItems.push({
                itemType: item.itemType,
                caption: dynamicValue(item.caption),
                action: undefined,
                styleClass: item.styleClass
            });
        });
    } else {
        props.customItems.forEach(item => {
            customItems.push({
                action: undefined,
                content: (
                    <item.content.renderer>
                        <div />
                    </item.content.renderer>
                )
            });
        });
    }

    return (
        <PopupMenuComponent
            {...props}
            class={props.className}
            basicItems={basicItems}
            customItems={customItems}
            menuTrigger={
                <props.menuTrigger.renderer>
                    <div />
                </props.menuTrigger.renderer>
            }
            name="Popup Menu"
            preview
            style={styles}
            tabIndex={0}
        />
    );
}
