import { createElement, KeyboardEvent, ReactElement, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import classNames from "classnames";
import "../ui/accordion-main.scss";
import { LoadContentEnum } from "typings/AccordionProps";

/* eslint-disable no-unused-vars */
export const enum Target {
    FIRST = "first",
    LAST = "last",
    PREVIOUS = "previous",
    NEXT = "next"
}
/* eslint-enable no-unused-vars */

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
}

export function AccordionGroup(props: AccordionGroupProps): ReactElement | null {
    const { animateContent, changeFocus, showHeaderIcon, toggleCollapsed, onToggleCompletion, loadContent } = props;

    const [renderCollapsed, setRenderCollapsed] = useState(props.collapsed);
    const previousRenderCollapsed = useRef(renderCollapsed);
    const animatingContent = useRef<boolean>(false);

    const rootRef = useRef<HTMLDivElement>(null);
    const contentWrapperRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const renderContent = useRef(loadContent === "always");

    renderContent.current ||= !renderCollapsed;

    const completeTransitioning = useCallback((): void => {
        if (contentWrapperRef.current && rootRef.current && animatingContent.current) {
            if (!renderCollapsed) {
                rootRef.current.classList.add("widget-accordion-group-collapsed");
                rootRef.current.classList.remove("widget-accordion-group-collapsing");
                setRenderCollapsed(true);
            } else {
                rootRef.current.classList.remove("widget-accordion-group-expanding");
                contentWrapperRef.current.style.height = "";
                setRenderCollapsed(false);
            }

            animatingContent.current = false;
        }
    }, [renderCollapsed]);

    useEffect(() => {
        if (
            props.collapsed !== renderCollapsed &&
            rootRef.current &&
            contentWrapperRef.current &&
            contentRef.current &&
            animateContent
        ) {
            animatingContent.current = true;
            if (props.collapsed) {
                contentWrapperRef.current.style.height = `${contentRef.current.getBoundingClientRect().height}px`;
                rootRef.current.classList.add("widget-accordion-group-collapsing");

                setTimeout(() => {
                    if (contentWrapperRef.current) {
                        contentWrapperRef.current.style.height = "";
                    }
                }, 50);
            } else {
                rootRef.current.classList.add("widget-accordion-group-expanding");
                rootRef.current.classList.remove("widget-accordion-group-collapsed");

                setTimeout(() => {
                    if (contentWrapperRef.current && contentRef.current) {
                        contentWrapperRef.current.style.height = `${
                            contentRef.current.getBoundingClientRect().height
                        }px`;
                    }
                }, 50);
            }
        } else if (props.collapsed !== renderCollapsed && (!animateContent || !props.visible)) {
            setRenderCollapsed(props.collapsed);
        }
    }, [props.collapsed, props.visible, renderCollapsed, animateContent]);

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
                ref={contentWrapperRef}
                id={`${props.id}ContentWrapper`}
                className={"widget-accordion-group-content-wrapper"}
                data-focusindex={0}
                onTransitionEnd={completeTransitioning}
                role="region"
                aria-labelledby={`${props.id}HeaderButton`}
            >
                <div ref={contentRef} className={"widget-accordion-group-content"}>
                    {renderContent.current && props.content}
                </div>
            </div>
        </section>
    );
}
