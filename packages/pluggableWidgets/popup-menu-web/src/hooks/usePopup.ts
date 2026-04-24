import {
    autoUpdate,
    flip,
    offset,
    Placement,
    safePolygon,
    shift,
    useClick,
    useDismiss,
    useFloating,
    UseFloatingReturn,
    useHover,
    useInteractions,
    UseInteractionsReturn,
    useListNavigation,
    useRole
} from "@floating-ui/react";
import { MutableRefObject, useRef } from "react";
import { ClippingStrategyEnum, TriggerEnum } from "../../typings/PopupMenuProps";

interface PopupOptions {
    placement?: Placement;
    modal?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    clippingStrategy?: ClippingStrategyEnum;
    trigger?: TriggerEnum;
    listRef?: MutableRefObject<Array<HTMLElement | null>>;
    activeIndex?: number | null;
    onNavigate?: (index: number | null) => void;
}

type FloatingReturn = Pick<UseFloatingReturn, "context" | "floatingStyles" | "refs">;
type InteractionReturn = Pick<UseInteractionsReturn, "getFloatingProps" | "getReferenceProps" | "getItemProps">;

export type UsePopupReturn = FloatingReturn &
    InteractionReturn & {
        modal?: boolean;
        open?: boolean;
    };

export function usePopup({
    placement = "bottom",
    modal,
    open,
    onOpenChange: setOpen,
    trigger,
    clippingStrategy,
    listRef,
    activeIndex,
    onNavigate
}: PopupOptions = {}): UsePopupReturn {
    const fallbackListRef = useRef<Array<HTMLElement | null>>([]);

    const { context, floatingStyles, refs } = useFloating({
        middleware: [offset(5), flip(), shift()],
        onOpenChange: setOpen,
        strategy: clippingStrategy,
        open,
        placement,
        whileElementsMounted: autoUpdate
    });

    const dismiss = useDismiss(context);
    const role = useRole(context, { role: "menu" });
    const click = useClick(context, { enabled: trigger === "onclick" });
    const hover = useHover(context, { enabled: trigger === "onhover", handleClose: safePolygon() });
    const listNav = useListNavigation(context, {
        listRef: listRef ?? fallbackListRef,
        activeIndex: activeIndex ?? null,
        onNavigate: onNavigate ?? (() => {}),
        loop: true
    });

    const { getFloatingProps, getReferenceProps, getItemProps } = useInteractions([
        dismiss,
        role,
        click,
        hover,
        listNav
    ]);

    return {
        context,
        floatingStyles,
        getFloatingProps,
        getReferenceProps,
        getItemProps,
        modal,
        open,
        refs
    };
}
