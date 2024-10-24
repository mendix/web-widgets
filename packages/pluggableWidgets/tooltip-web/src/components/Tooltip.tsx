import { Placement } from "@floating-ui/react";
import classNames from "classnames";
import { createElement, CSSProperties, ReactElement, ReactNode, useState } from "react";
import { OpenOnEnum, RenderMethodEnum } from "../../typings/TooltipProps";
import { useFloatingUI } from "../utils/useFloatingUI";

export interface TooltipProps {
    name?: string;
    class?: string;
    style?: CSSProperties;
    tabIndex?: number;
    trigger: ReactNode;
    renderMethod: RenderMethodEnum;
    htmlMessage: ReactNode;
    textMessage?: string;
    position: Placement;
    openOn: OpenOnEnum;
    preview?: boolean;
}

export const Tooltip = (props: TooltipProps): ReactElement => {
    const { trigger, htmlMessage, textMessage, openOn, position, preview, renderMethod } = props;
    const [showTooltip, setShowTooltip] = useState(preview ?? false);
    const [arrowElement, setArrowElement] = useState<HTMLDivElement | null>(null);
    const { arrowStyles, blurFocusEvents, floatingStyles, getFloatingProps, getReferenceProps, refs, staticSide } =
        useFloatingUI({
            position,
            showTooltip,
            setShowTooltip,
            arrowElement,
            openOn
        });

    return (
        <div className={classNames(props.class, "widget-tooltip", `widget-tooltip-${position}`)}>
            <div
                className="widget-tooltip-trigger"
                ref={refs?.setReference}
                {...(preview
                    ? undefined
                    : getReferenceProps?.({ ...(openOn === "hoverFocus" && !preview ? blurFocusEvents : undefined) }))}
            >
                {trigger}
            </div>
            {showTooltip && (textMessage || htmlMessage) ? (
                <div
                    className="widget-tooltip-content"
                    ref={refs?.setFloating}
                    style={floatingStyles}
                    {...getFloatingProps?.()}
                >
                    {renderMethod === "text" ? textMessage : htmlMessage}
                    <div className={`widget-tooltip-arrow-${staticSide}`} ref={setArrowElement} style={arrowStyles} />
                </div>
            ) : null}
        </div>
    );
};
