import { Placement } from "@floating-ui/react";
import classNames from "classnames";
import { createElement, CSSProperties, ReactElement, ReactNode, useState } from "react";
import { OpenOnEnum, RenderMethodEnum } from "../../typings/TooltipProps";
import { useFloatingUI } from "src/utils/useFloatingUI";

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
    const { refs, floatingStyles, staticSide, arrowStyles, getReferenceProps, getFloatingProps } = useFloatingUI({
        position,
        showTooltip,
        setShowTooltip,
        arrowElement,
        openOn
    });

    const renderTrigger = (): ReactElement => {
        return (
            <div
                className="widget-tooltip-trigger"
                ref={refs.setReference}
                {...(preview ? undefined : getReferenceProps())}
            >
                {trigger}
            </div>
        );
    };

    const renderTooltip = (): ReactNode => {
        return showTooltip && (textMessage || htmlMessage) ? (
            <div
                className="widget-tooltip-content"
                ref={refs.setFloating}
                style={floatingStyles}
                {...getFloatingProps()}
            >
                {renderMethod === "text" ? textMessage : htmlMessage}
                <div className={`widget-tooltip-arrow-${staticSide}`} ref={setArrowElement} style={arrowStyles} />
            </div>
        ) : null;
    };
    return (
        <div className={classNames(props.class, "widget-tooltip", `widget-tooltip-${position}`)}>
            {renderTrigger()}
            {renderTooltip()}
        </div>
    );
};
