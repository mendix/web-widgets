import { parseStyle } from "@mendix/widget-plugin-platform/preview/parse-style";
import classNames from "classnames";
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

    const isDesign = props.renderMode === "design";
    const isDropzoneEmpty = props.menuTrigger.widgetCount === 0;

    const popupMenuClass = classNames("popupmenu", {
        "popupmenu--design-empty": isDesign && isDropzoneEmpty
    });

    return (
        <PopupMenuComponent
            {...props}
            class={popupMenuClass}
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
