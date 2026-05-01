import { Placement } from "@floating-ui/react";
import classNames from "classnames";
import { CSSProperties, ReactElement, ReactNode, useCallback, useEffect, useId, useRef, useState } from "react";
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
    const contentId = useId();
    const hasTooltipContent = !!(textMessage || htmlMessage);
    const triggerWrapperRef = useRef<HTMLDivElement>(null);

    const { arrowStyles, blurFocusEvents, floatingStyles, getFloatingProps, getReferenceProps, refs, staticSide } =
        useFloatingUI({
            position,
            showTooltip,
            setShowTooltip,
            arrowElement,
            openOn
        });

    // Apply aria-describedby to all focusable elements inside the trigger wrapper
    useEffect(() => {
        if (!hasTooltipContent || !triggerWrapperRef.current) {
            return;
        }

        // Find all focusable elements (button, a, input, select, textarea, etc.)
        const focusableElements = triggerWrapperRef.current.querySelectorAll<HTMLElement>(
            'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length > 0) {
            focusableElements.forEach(element => {
                element.setAttribute("aria-describedby", contentId);
            });

            return () => {
                focusableElements.forEach(element => {
                    element.removeAttribute("aria-describedby");
                });
            };
        }
    }, [hasTooltipContent, contentId]);

    // Merge our ref with floating-ui's ref
    const setTriggerRef = useCallback(
        (node: HTMLDivElement | null) => {
            triggerWrapperRef.current = node;
            if (refs?.setReference) {
                refs.setReference(node);
            }
        },
        [refs]
    );

    return (
        <div className={classNames(props.class, "widget-tooltip", `widget-tooltip-${position}`)}>
            <div
                className="widget-tooltip-trigger"
                ref={setTriggerRef}
                {...(preview
                    ? undefined
                    : getReferenceProps?.({ ...(openOn === "hoverFocus" && !preview ? blurFocusEvents : undefined) }))}
            >
                {trigger}
            </div>
            {/* Hidden content for screen readers - always in DOM, only accessible via aria-describedby */}
            {hasTooltipContent && (
                <div id={contentId} className="sr-only" aria-hidden="true">
                    {renderMethod === "text" ? textMessage : htmlMessage}
                </div>
            )}
            {/* Visible content for sighted users */}
            {showTooltip && hasTooltipContent ? (
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
