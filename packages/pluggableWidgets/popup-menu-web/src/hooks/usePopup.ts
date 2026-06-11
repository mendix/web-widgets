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
    useFloatingNodeId,
    UseFloatingReturn,
    useHover,
    useInteractions,
    UseInteractionsReturn,
    useRole
} from "@floating-ui/react";
import { ClippingStrategyEnum, HoverCloseOnEnum, TriggerEnum } from "../../typings/PopupMenuProps";

interface PopupOptions {
    placement: Placement;
    open: boolean;
    onOpenChange?: (open: boolean) => void;
    clippingStrategy: ClippingStrategyEnum;
    trigger: TriggerEnum;
    hoverCloseOn: HoverCloseOnEnum;
}

type FloatingReturn = Pick<UseFloatingReturn, "context" | "floatingStyles" | "refs">;
type InteractionReturn = Pick<UseInteractionsReturn, "getFloatingProps" | "getReferenceProps">;

export type UsePopupReturn = FloatingReturn &
    InteractionReturn & {
        open: boolean;
        nodeId: string;
    };

export function usePopup({
    placement = "bottom",
    open,
    onOpenChange: setOpen,
    trigger,
    clippingStrategy,
    hoverCloseOn
}: PopupOptions): UsePopupReturn {
    const nodeId = useFloatingNodeId();

    const { context, floatingStyles, refs } = useFloating({
        nodeId,
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

    const hover = useHover(context, {
        enabled: trigger === "onhover",
        handleClose: hoverCloseOn === "onHoverLeave" ? safePolygon() : neverClose
    });

    const { getFloatingProps, getReferenceProps } = useInteractions([dismiss, role, click, hover]);

    return {
        context,
        floatingStyles,
        getFloatingProps,
        getReferenceProps,
        open,
        refs,
        nodeId
    };
}

const neverClose = Object.assign(
    (): (() => void) => {
        return (): void => {};
    },
    { __options: { blockPointerEvents: false } }
);
