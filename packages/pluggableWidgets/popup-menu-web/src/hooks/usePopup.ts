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
    useRole
} from "@floating-ui/react";
import { TriggerEnum, ClippingStrategyEnum } from "../../typings/PopupMenuProps";

interface PopupOptions {
    placement?: Placement;
    modal?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    clippingStrategy?: ClippingStrategyEnum;
    trigger?: TriggerEnum;
}

type FloatingReturn = Pick<UseFloatingReturn, "context" | "floatingStyles" | "refs">;
type InteractionReturn = Pick<UseInteractionsReturn, "getFloatingProps" | "getReferenceProps">;

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
    clippingStrategy
}: PopupOptions = {}): UsePopupReturn {
    const { context, floatingStyles, refs } = useFloating({
        middleware: [offset(5), flip(), shift()],
        onOpenChange: setOpen,
        strategy: clippingStrategy,
        open,
        placement,
        whileElementsMounted: autoUpdate
    });

    const dismiss = useDismiss(context);
    const role = useRole(context);
    const click = useClick(context, { enabled: trigger === "onclick" });
    const hover = useHover(context, { enabled: trigger === "onhover", handleClose: safePolygon() });

    const { getFloatingProps, getReferenceProps } = useInteractions([dismiss, role, click, hover]);

    return {
        context,
        floatingStyles,
        getFloatingProps,
        getReferenceProps,
        modal,
        open,
        refs
    };
}
