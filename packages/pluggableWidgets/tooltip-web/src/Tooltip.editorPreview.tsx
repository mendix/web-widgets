import { ReactElement } from "react";

import { parseStyle } from "@mendix/widget-plugin-platform/preview/parse-style";
import { Tooltip } from "./components/Tooltip";
import { translatePosition } from "./utils";
import { TooltipPreviewProps } from "../typings/TooltipProps";

export const preview = (props: TooltipPreviewProps): ReactElement => {
    return (
        <Tooltip
            class={props.className}
            htmlMessage={
                <props.htmlMessage.renderer caption="Place widgets here">
                    <div />
                </props.htmlMessage.renderer>
            }
            trigger={
                <props.trigger.renderer caption="Place widgets here">
                    <div />
                </props.trigger.renderer>
            }
            openOn={props.openOn}
            position={translatePosition(props.tooltipPosition, props.arrowPosition)}
            preview
            renderMethod={props.renderMethod}
            style={parseStyle(props.style)}
            textMessage={props.textMessage}
        />
    );
};

export function getPreviewCss(): string {
    return require("./ui/Tooltip.scss");
}
