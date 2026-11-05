import { Placement } from "@floating-ui/react";
import classNames from "classnames";
import {
    CSSProperties,
    ReactElement,
    ReactNode,
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState
} from "react";
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

const FOCUSABLE_SELECTOR = 'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const getDescribedByIds = (element: HTMLElement): string[] =>
    element.getAttribute("aria-describedby")?.split(/\s+/).filter(Boolean) ?? [];

export const Tooltip = (props: TooltipProps): ReactElement => {
    const { trigger, htmlMessage, textMessage, openOn, position, preview, renderMethod } = props;
    const [showTooltip, setShowTooltip] = useState(preview ?? false);
    const [arrowElement, setArrowElement] = useState<HTMLDivElement | null>(null);
    const content = renderMethod === "text" ? textMessage : htmlMessage;
    const hasTooltipContent = !!content;
    const triggerWrapperRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);

    const { arrowStyles, blurFocusEvents, floatingStyles, getFloatingProps, getReferenceProps, refs, staticSide } =
        useFloatingUI({
            position,
            showTooltip,
            setShowTooltip,
            arrowElement,
            openOn
        });
    const floatingProps = getFloatingProps?.();
    const contentId = floatingProps?.id as string | undefined;

    // Add the tooltip to the aria-describedby of all focusable elements inside the trigger wrapper.
    // Trigger widgets can render late or reset the attribute, so keep watching the wrapper.
    useEffect(() => {
        const wrapper = triggerWrapperRef.current;
        if (preview || !hasTooltipContent || !contentId || !wrapper) {
            return;
        }

        const applyDescription = (): void => {
            wrapper.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR).forEach(element => {
                const ids = getDescribedByIds(element);
                if (!ids.includes(contentId)) {
                    element.setAttribute("aria-describedby", [...ids, contentId].join(" "));
                }
            });
        };

        applyDescription();
        const observer = new MutationObserver(applyDescription);
        observer.observe(wrapper, {
            attributes: true,
            attributeFilter: ["aria-describedby", "href", "tabindex"],
            childList: true,
            subtree: true
        });

        return () => {
            observer.disconnect();
            wrapper.querySelectorAll<HTMLElement>("[aria-describedby]").forEach(element => {
                const ids = getDescribedByIds(element).filter(id => id !== contentId);
                if (ids.length > 0) {
                    element.setAttribute("aria-describedby", ids.join(" "));
                } else {
                    element.removeAttribute("aria-describedby");
                }
            });
        };
    }, [hasTooltipContent, contentId, preview]);

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

    // Floating UI only tracks the content while the tooltip is open
    const setContentRef = useCallback(
        (node: HTMLDivElement | null) => {
            contentRef.current = node;
            refs?.setFloating?.(showTooltip ? node : null);
        },
        [refs, showTooltip]
    );

    // Set through the DOM because React versions handle the inert prop differently
    useLayoutEffect(() => {
        contentRef.current?.toggleAttribute("inert", !showTooltip);
    }, [hasTooltipContent, showTooltip]);

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
            {/* Always in the DOM so aria-describedby can reference it, visible only while open */}
            {hasTooltipContent ? (
                <div
                    className={showTooltip ? "widget-tooltip-content" : "widget-tooltip-sr-only"}
                    ref={setContentRef}
                    style={showTooltip ? floatingStyles : undefined}
                    {...floatingProps}
                    aria-hidden={showTooltip ? undefined : true}
                    data-overlay-content={showTooltip ? true : undefined}
                >
                    {content}
                    {showTooltip && (
                        <div
                            className={`widget-tooltip-arrow-${staticSide}`}
                            ref={setArrowElement}
                            style={arrowStyles}
                        />
                    )}
                </div>
            ) : null}
        </div>
    );
};
