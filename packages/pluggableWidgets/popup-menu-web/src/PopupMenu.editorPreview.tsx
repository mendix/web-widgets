import classNames from "classnames";
import { ReactElement } from "react";

import { parseStyle } from "@mendix/widget-plugin-platform/preview/parse-style";
import { PopupMenuPreviewProps } from "../typings/PopupMenuProps";

export function getPreviewCss(): string {
    return require("./ui/PopupMenuPreview.scss");
}

export function preview(props: PopupMenuPreviewProps): ReactElement {
    const showMenu = props.advancedMode && props.customItems.length > 0;

    return (
        <div className={classNames("popupmenu", props.class)}>
            <div className="popupmenu-trigger">
                <props.menuTrigger.renderer>
                    <div />
                </props.menuTrigger.renderer>
            </div>
            <div className="widget-popupmenu-root">
                {showMenu && (
                    <ul style={parseStyle(props.style)} className="popupmenu-menu">
                        {props.customItems.map((item, index) => (
                            <item.content.renderer key={index}>
                                <li className={"popupmenu-custom-item"}></li>
                            </item.content.renderer>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
