import {
    arrow,
    autoUpdate,
    flip,
    offset,
    Placement,
    shift,
    useClick,
    useDismiss,
    useFloating,
    useFocus,
    useHover,
    useInteractions,
    useRole
} from "@floating-ui/react";
import classNames from "classnames";
import { createElement, CSSProperties, ReactElement, ReactNode, useState } from "react";
import { OpenOnEnum, RenderMethodEnum } from "../../typings/TooltipProps";

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
    const { refs, floatingStyles, context, middlewareData, placement } = useFloating({
        placement: position,
        open: showTooltip,
        onOpenChange: setShowTooltip,
        middleware: [
            offset(8),
            flip({
                fallbackPlacements: ["top", "right", "bottom", "left"]
            }),
            shift(),
            arrow({ element: arrowElement })
        ],
        whileElementsMounted: autoUpdate
    });

    const hover = useHover(context, { enabled: ["hover", "hoverFocus"].includes(openOn), move: false });
    const focus = useFocus(context, { enabled: openOn === "hoverFocus" });
    const click = useClick(context, { toggle: showTooltip, enabled: openOn === "click" });
    const dismiss = useDismiss(context, { outsidePress: true });
    const role = useRole(context, {
        role: "tooltip"
    });

    const side = placement.split("-")[0];
    const TIP_SIDES_MAP: { [key: string]: string } = {
        top: "bottom",
        right: "left",
        bottom: "top",
        left: "right"
    };

    const staticSide = TIP_SIDES_MAP[side];

    const arrowStyles = {
        left: middlewareData.arrow?.x ?? "",
        top: middlewareData.arrow?.y ?? "",
        [staticSide]: `-4px`
    };

    const { getReferenceProps, getFloatingProps } = useInteractions([focus, hover, click, dismiss, role]);

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
                role="tooltip"
            >
                {renderMethod === "text" ? textMessage : htmlMessage}
                <div className="widget-tooltip-arrow" ref={setArrowElement} style={arrowStyles} />
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
