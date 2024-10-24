import {
    arrow,
    autoUpdate,
    flip,
    offset,
    Placement,
    ReferenceElement,
    safePolygon,
    shift,
    useClick,
    useDismiss,
    useFloating,
    UseFloatingReturn,
    useFocus,
    useHover,
    useInteractions,
    useRole
} from "@floating-ui/react";
import { useCallback } from "react";
import { OpenOnEnum } from "../../typings/TooltipProps";
interface FloatingProps {
    position: Placement;
    showTooltip: boolean;
    setShowTooltip: React.Dispatch<React.SetStateAction<boolean>>;
    arrowElement: HTMLDivElement | null;
    openOn: OpenOnEnum;
}

type UseInteractionsReturn = ReturnType<typeof useInteractions>;

interface InternalFloatingProps {
    staticSide: string;
    arrowStyles: {
        left: string | number;
        top: string | number;
    };
    blurFocusEvents: {
        onFocus: () => void;
        onBlur: () => void;
    };
}

type FloatingPropsReturn = Partial<UseFloatingReturn<ReferenceElement>> &
    Partial<InternalFloatingProps> &
    Partial<UseInteractionsReturn>;

export function useFloatingUI(props: FloatingProps): FloatingPropsReturn {
    const { position, showTooltip, setShowTooltip, arrowElement, openOn } = props;
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

    const hover = useHover(context, {
        enabled: ["hover", "hoverFocus"].includes(openOn),
        move: false,
        delay: {
            open: 25,
            close: 0
        },
        restMs: 25,
        handleClose: safePolygon()
    });
    const focus = useFocus(context, { enabled: openOn === "hoverFocus" });
    const click = useClick(context, { toggle: showTooltip, enabled: openOn === "click" });
    const dismiss = useDismiss(context, { outsidePress: true });
    const role = useRole(context, { role: "tooltip" });

    const onShow = useCallback(() => setShowTooltip(true), [setShowTooltip]);
    const onHide = useCallback(() => setShowTooltip(false), [setShowTooltip]);
    const blurFocusEvents = { onFocus: onShow, onBlur: onHide };

    const side = placement.split("-")[0];
    const alignment = placement.split("-")[1];
    const alignmentOffset =
        ["top", "bottom"].includes(side) && alignment === "start" ? arrowElement?.offsetWidth ?? 0 : 0;
    const staticSide: string | undefined = {
        top: "bottom",
        right: "left",
        bottom: "top",
        left: "right"
    }[side];
    let arrowStyles;
    if (middlewareData.arrow) {
        const { x: arrowX, y: arrowY } = middlewareData.arrow;
        arrowStyles = {
            left: arrowX ? arrowX - alignmentOffset : "",
            top: arrowY ?? ""
        };
    }

    const { getReferenceProps, getFloatingProps } = useInteractions([focus, hover, click, dismiss, role]);
    return {
        arrowStyles,
        blurFocusEvents,
        floatingStyles,
        getFloatingProps,
        getReferenceProps,
        refs,
        staticSide
    };
}
