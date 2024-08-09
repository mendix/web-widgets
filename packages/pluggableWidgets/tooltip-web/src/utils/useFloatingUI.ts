import {
    arrow,
    autoUpdate,
    flip,
    offset,
    Placement,
    shift,
    useClick,
    useDismiss,
    useFloating,
    useFocus,
    useHover,
    useInteractions,
    useRole,
    UseFloatingReturn,
    ReferenceElement
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

    const hover = useHover(context, { enabled: ["hover", "hoverFocus"].includes(openOn), move: false });
    const focus = useFocus(context, { enabled: openOn === "hoverFocus" });
    const click = useClick(context, { toggle: showTooltip, enabled: openOn === "click" });
    const dismiss = useDismiss(context, { outsidePress: true });
    const role = useRole(context, {
        role: "tooltip"
    });

    const onShow = useCallback(() => setShowTooltip(true), []);
    const onHide = useCallback(() => setShowTooltip(false), []);
    const blurFocusEvents = { onFocus: onShow, onBlur: onHide };

    const side = placement.split("-")[0];
    const TIP_SIDES_MAP: { [key: string]: string } = {
        top: "bottom",
        right: "left",
        bottom: "top",
        left: "right"
    };

    const staticSide = TIP_SIDES_MAP[side];

    const arrowStyles = {
        left: middlewareData.arrow?.x ?? "",
        top: middlewareData.arrow?.y ?? ""
    };

    const { getReferenceProps, getFloatingProps } = useInteractions([focus, hover, click, dismiss, role]);
    return {
        refs,
        floatingStyles,
        staticSide,
        arrowStyles,
        getReferenceProps,
        getFloatingProps,
        blurFocusEvents
    };
}
