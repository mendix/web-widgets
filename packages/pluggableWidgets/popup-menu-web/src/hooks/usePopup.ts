import {
    autoUpdate,
    ElementProps,
    flip,
    offset,
    Placement,
    safePolygon,
    shift,
    useClick,
    useDismiss,
    useFloating,
    useFloatingNodeId,
    useFloatingParentNodeId,
    UseFloatingReturn,
    useHover,
    useInteractions,
    UseInteractionsReturn,
    useListNavigation,
    useRole
} from "@floating-ui/react";
import { MutableRefObject, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ClippingStrategyEnum, HoverCloseOnEnum, TriggerEnum } from "../../typings/PopupMenuProps";

interface PopupOptions {
    placement: Placement;
    open: boolean;
    onOpenChange?: (open: boolean) => void;
    clippingStrategy: ClippingStrategyEnum;
    trigger: TriggerEnum;
    hoverCloseOn: HoverCloseOnEnum;
    /** Whether the menu has any items to focus. */
    hasItems?: boolean;
}

type FloatingReturn = Pick<UseFloatingReturn, "context" | "floatingStyles" | "refs">;
type InteractionReturn = Pick<UseInteractionsReturn, "getFloatingProps" | "getReferenceProps" | "getItemProps">;

export type UsePopupReturn = FloatingReturn &
    InteractionReturn & {
        open: boolean;
        nodeId: string;
        isNested: boolean;
        setOpen: (open: boolean) => void;
        activeIndex: number | null;
        setActiveIndex: (index: number | null) => void;
        listRef: MutableRefObject<Array<HTMLElement | null>>;
        /** Element that gets focus back when the menu closes. */
        returnFocusRef: MutableRefObject<HTMLElement | null>;
        /** Set while a trigger key press is handled, to ignore the follow-up synthetic click. */
        keyboardActivationRef: MutableRefObject<boolean>;
    };

export function usePopup({
    placement = "bottom",
    open,
    onOpenChange,
    trigger,
    clippingStrategy,
    hoverCloseOn,
    hasItems = true
}: PopupOptions): UsePopupReturn {
    const nodeId = useFloatingNodeId();
    const isNested = useFloatingParentNodeId() != null;
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const listRef = useRef<Array<HTMLElement | null>>([]);
    const returnFocusRef = useRef<HTMLElement | null>(null);
    const keyboardActivationRef = useRef(false);
    const setOpen = (next: boolean): void => onOpenChange?.(next);

    const { context, floatingStyles, refs } = useFloating({
        nodeId,
        middleware: [offset(5), flip(), shift()],
        onOpenChange: setOpen,
        strategy: clippingStrategy,
        open,
        placement,
        whileElementsMounted: autoUpdate
    });

    useLayoutEffect(() => {
        if (open && !isNested) {
            // Recorded before list navigation moves focus into the menu.
            const active = document.activeElement;
            returnFocusRef.current = active instanceof HTMLElement ? active : null;
        }
    }, [open, isNested]);

    const dismiss = useDismiss(context, { escapeKey: false });
    const role = useRole(context, { role: "menu" });
    const click = useClick(context, { enabled: trigger === "onclick", keyboardHandlers: false });
    const guardedClick = useMemo(
        () =>
            wrapClick(click, keyboardActivationRef, () => {
                // Opening by click focuses the first item (APG menu button).
                if (!open) {
                    setActiveIndex(hasItems ? 0 : null);
                }
            }),
        [click, open, hasItems]
    );

    const hover = useHover(context, {
        enabled: trigger === "onhover",
        handleClose: hoverCloseOn === "onHoverLeave" ? safePolygon() : neverClose
    });

    const listNavigation = useListNavigation(context, {
        listRef,
        activeIndex,
        onNavigate: setActiveIndex,
        loop: true,
        // Opening from the keyboard focuses an item; programmatic (Menu toggle) and hover opening don't.
        focusItemOnOpen: "auto",
        // Keep mouse behavior as before: hovering an item doesn't move focus.
        focusItemOnHover: false
    });

    const { getFloatingProps, getReferenceProps, getItemProps } = useInteractions([
        dismiss,
        role,
        guardedClick,
        hover,
        listNavigation
    ]);

    return {
        context,
        floatingStyles,
        getFloatingProps,
        getReferenceProps,
        getItemProps,
        open,
        refs,
        nodeId,
        isNested,
        setOpen,
        activeIndex,
        setActiveIndex,
        listRef,
        returnFocusRef,
        keyboardActivationRef
    };
}

/**
 * Trigger content that doesn't prevent default (e.g. a native button) gets a
 * browser-synthesized click after Enter/Space. The key press already toggled
 * the menu, so that click must not toggle it again.
 */
function wrapClick(
    props: ElementProps,
    keyboardActivationRef: MutableRefObject<boolean>,
    onPointerClick: () => void
): ElementProps {
    const onClick = props.reference?.onClick;
    if (!onClick) {
        return props;
    }
    return {
        ...props,
        reference: {
            ...props.reference,
            onClick(event) {
                if (keyboardActivationRef.current && event.detail === 0) {
                    return;
                }
                onPointerClick();
                onClick(event);
            }
        }
    };
}

const neverClose = Object.assign(
    (): (() => void) => {
        return (): void => {};
    },
    { __options: { blockPointerEvents: false } }
);
