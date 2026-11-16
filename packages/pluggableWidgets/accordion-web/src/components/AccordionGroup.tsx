import classNames from "classnames";
import {
    Key,
    KeyboardEvent,
    ReactElement,
    ReactNode,
    TransitionEvent,
    useCallback,
    useEffect,
    useRef,
    useState
} from "react";
import { LoadContentEnum } from "typings/AccordionProps";
import "../ui/accordion-main.scss";

export const enum Target {
    FIRST = "first",
    LAST = "last",
    PREVIOUS = "previous",
    NEXT = "next"
}

export type AccordionGroupIcon = { icon: ReactNode } | { expandIcon: ReactNode; collapseIcon: ReactNode };

export interface AccordionGroupProps {
    id: string;
    header: ReactNode;
    content: ReactNode;
    collapsed: boolean;
    visible: boolean;
    dynamicClassName?: string;
    collapsible: boolean;
    toggleCollapsed?: () => void;
    onToggleCompletion?: (collapsed: boolean) => void;
    changeFocus?: (focusedGroupHeader: EventTarget | null, focusTargetGroupHeader: Target) => void;
    animateContent?: boolean;
    generateHeaderIcon?: (collapsed: boolean) => ReactElement;
    showHeaderIcon?: "right" | "left" | "no";
    loadContent: LoadContentEnum;
    key?: Key;
}

export function AccordionGroup(props: AccordionGroupProps): ReactElement | null {
    const { animateContent, changeFocus, showHeaderIcon, toggleCollapsed, onToggleCompletion, loadContent } = props;

    const [renderCollapsed, setRenderCollapsed] = useState(props.collapsed);
    const previousRenderCollapsed = useRef(renderCollapsed);
    const animatingContent = useRef<boolean>(false);
    const fallbackTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    const rootRef = useRef<HTMLDivElement>(null);
    const renderContent = useRef(loadContent === "always");

    // Render content as soon as expanding starts, so it is present during the whole animation.
    renderContent.current ||= !props.collapsed || !renderCollapsed;

    const clearFallbackTimer = useCallback((): void => {
        clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = undefined;
    }, []);

    useEffect(() => clearFallbackTimer, [clearFallbackTimer]);

    const completeTransitioning = useCallback((): void => {
        if (rootRef.current && animatingContent.current) {
            clearFallbackTimer();
            if (!renderCollapsed) {
                rootRef.current.classList.add("widget-accordion-group-collapsed");
                rootRef.current.classList.remove("widget-accordion-group-collapsing");
                setRenderCollapsed(true);
            } else {
                rootRef.current.classList.remove("widget-accordion-group-expanding");
                setRenderCollapsed(false);
            }

            animatingContent.current = false;
        }
    }, [renderCollapsed, clearFallbackTimer]);

    const onTransitionEnd = useCallback(
        (event: TransitionEvent<HTMLElement>): void => {
            // Ignore transitions bubbling up from the header icon or the content.
            if (event.target === event.currentTarget && event.propertyName === "grid-template-rows") {
                completeTransitioning();
            }
        },
        [completeTransitioning]
    );

    useEffect(() => {
        if (props.collapsed !== renderCollapsed && rootRef.current && animateContent) {
            animatingContent.current = true;
            if (props.collapsed) {
                rootRef.current.classList.add("widget-accordion-group-collapsing");
            } else {
                rootRef.current.classList.add("widget-accordion-group-expanding");
                rootRef.current.classList.remove("widget-accordion-group-collapsed");
            }

            // transitionend does not fire when there is no transition (prefers-reduced-motion, a theme
            // override, an unsupported browser) or when the group is not rendered (for example in a hidden tab).
            const transitionTime = getTransitionTime(rootRef.current);
            clearFallbackTimer();
            if (transitionTime === 0) {
                completeTransitioning();
            } else {
                fallbackTimerRef.current = setTimeout(completeTransitioning, transitionTime + 100);
            }
        } else if (props.collapsed !== renderCollapsed && (!animateContent || !props.visible)) {
            setRenderCollapsed(props.collapsed);
        } else if (props.collapsed === renderCollapsed) {
            // if state and props looses their sync due to "complete transition" not being triggered
            // make sure it is sync back in.
            if (
                (renderCollapsed && rootRef.current?.classList.contains("widget-accordion-group-expanding")) ||
                (!renderCollapsed && rootRef.current?.classList.contains("widget-accordion-group-collapsing"))
            ) {
                completeTransitioning();
            }
        }
    }, [props.collapsed, props.visible, renderCollapsed, animateContent, completeTransitioning, clearFallbackTimer]);

    useEffect(() => {
        if (renderCollapsed !== previousRenderCollapsed.current) {
            previousRenderCollapsed.current = renderCollapsed;
            onToggleCompletion?.(props.collapsed);
        }
    }, [props.collapsed, onToggleCompletion, renderCollapsed]);

    const onKeydownHandler = useCallback(
        (event: KeyboardEvent<HTMLDivElement>) => {
            switch (event.key) {
                case "Enter":
                case " ":
                case "Space":
                    event.preventDefault();
                    toggleCollapsed?.();
                    break;
                case "Home":
                    event.preventDefault();
                    changeFocus?.(event.currentTarget, Target.FIRST);
                    break;
                case "End":
                    event.preventDefault();
                    changeFocus?.(event.currentTarget, Target.LAST);
                    break;
                case "Up": // Microsoft Edge value
                case "ArrowUp":
                    event.preventDefault();
                    changeFocus?.(event.currentTarget, Target.PREVIOUS);
                    break;
                case "Down": // Microsoft Edge value
                case "ArrowDown":
                    event.preventDefault();
                    changeFocus?.(event.currentTarget, Target.NEXT);
                    break;
            }
        },
        [toggleCollapsed, changeFocus]
    );

    if (!props.visible) {
        return null;
    }

    return (
        <section
            ref={rootRef}
            className={classNames(
                "widget-accordion-group",
                {
                    "widget-accordion-group-collapsed": renderCollapsed
                },
                props.dynamicClassName
            )}
            onTransitionEnd={onTransitionEnd}
        >
            <header className={"widget-accordion-group-header"}>
                <div
                    id={`${props.id}HeaderButton`}
                    className={classNames("widget-accordion-group-header-button", {
                        "widget-accordion-group-header-button-clickable": props.collapsible,
                        "widget-accordion-group-header-button-icon-left":
                            props.collapsible && showHeaderIcon === "left",
                        "widget-accordion-group-header-button-icon-right":
                            props.collapsible && showHeaderIcon === "right"
                    })}
                    tabIndex={props.collapsible ? 0 : undefined}
                    data-focusindex={0}
                    role="button"
                    onClick={props.collapsible ? toggleCollapsed : undefined}
                    onKeyDown={props.collapsible ? onKeydownHandler : undefined}
                    aria-expanded={!renderCollapsed}
                    aria-disabled={!props.collapsible}
                    aria-controls={`${props.id}ContentWrapper`}
                >
                    {props.header}
                    {props.collapsible && (showHeaderIcon === "left" || showHeaderIcon === "right")
                        ? props.generateHeaderIcon?.(renderCollapsed ?? false)
                        : null}
                </div>
            </header>
            <div
                id={`${props.id}ContentWrapper`}
                className={"widget-accordion-group-content-wrapper"}
                data-focusindex={0}
                role="region"
                aria-labelledby={`${props.id}HeaderButton`}
            >
                <div className={"widget-accordion-group-content"}>{renderContent.current && props.content}</div>
            </div>
        </section>
    );
}

/** Longest transition (duration + delay) in milliseconds currently applied to the element. */
function getTransitionTime(element: HTMLElement): number {
    const style = window.getComputedStyle(element);
    const toMs = (value: string): number[] =>
        value.split(",").map(time => {
            const parsed = parseFloat(time);
            if (Number.isNaN(parsed)) {
                return 0;
            }
            return time.trim().endsWith("ms") ? parsed : parsed * 1000;
        });
    const durations = toMs(style.transitionDuration);
    const delays = toMs(style.transitionDelay);
    return Math.max(0, ...durations.map((duration, i) => duration + (delays[i % delays.length] ?? 0)));
}
