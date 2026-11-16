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

const MEDIA_SELECTOR = "img, svg, video, canvas, iframe, input, select, textarea";

const getDescribedByIds = (element: HTMLElement): string[] =>
    element.getAttribute("aria-describedby")?.split(/\s+/).filter(Boolean) ?? [];

const hasRenderedContent = (element: HTMLElement): boolean =>
    !!element.textContent?.trim() || !!element.querySelector(MEDIA_SELECTOR);

export const Tooltip = (props: TooltipProps): ReactElement => {
    const { trigger, htmlMessage, textMessage, openOn, position, preview, renderMethod } = props;
    const [showTooltip, setShowTooltip] = useState(preview ?? false);
    const [arrowElement, setArrowElement] = useState<HTMLDivElement | null>(null);
    const [hasVisibleContent, setHasVisibleContent] = useState(false);
    const content = renderMethod === "text" ? textMessage : htmlMessage;
    const hasTooltipContent = renderMethod === "text" ? !!textMessage?.trim() : !!htmlMessage;
    // The preview always shows its content so the drop zone stays usable
    const isContentVisible = !!preview || hasVisibleContent;
    const isOpen = showTooltip && isContentVisible;
    const triggerWrapperRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);

    const {
        arrowStyles,
        blurFocusEvents,
        floatingFocusEvents,
        floatingStyles,
        getFloatingProps,
        getReferenceProps,
        refs,
        staticSide
    } = useFloatingUI({
        position,
        showTooltip: isOpen,
        setShowTooltip,
        arrowElement,
        openOn
    });
    const floatingProps = getFloatingProps?.(openOn === "hoverFocus" ? floatingFocusEvents : undefined);
    const contentId = floatingProps?.id as string | undefined;

    // Add the tooltip to the aria-describedby of all focusable elements inside the trigger wrapper.
    // Trigger widgets can render late or reset the attribute, so keep watching the wrapper.
    useEffect(() => {
        const wrapper = triggerWrapperRef.current;
        if (preview || !hasTooltipContent || !hasVisibleContent || !contentId || !wrapper) {
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
    }, [hasTooltipContent, hasVisibleContent, contentId, preview]);

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
            refs?.setFloating?.(isOpen ? node : null);
        },
        [refs, isOpen]
    );

    // Custom widgets can be hidden by conditional visibility, so check what the content actually renders
    useLayoutEffect(() => {
        const element = contentRef.current;
        if (!element) {
            setHasVisibleContent(false);
            return;
        }

        const updateVisibleContent = (): void => setHasVisibleContent(hasRenderedContent(element));
        updateVisibleContent();
        const observer = new MutationObserver(updateVisibleContent);
        observer.observe(element, { characterData: true, childList: true, subtree: true });

        return () => observer.disconnect();
    }, [hasTooltipContent]);

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
            {/* Always in the DOM so aria-describedby can reference it, display: none while closed */}
            {hasTooltipContent ? (
                <div
                    className={isOpen ? "widget-tooltip-content" : undefined}
                    ref={setContentRef}
                    style={isOpen ? floatingStyles : undefined}
                    {...floatingProps}
                    hidden={!isOpen}
                    data-overlay-content={isOpen ? true : undefined}
                >
                    {content}
                    {isOpen && (
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
