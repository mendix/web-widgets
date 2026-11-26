import {
    arrow,
    autoUpdate,
    flip,
    offset,
    Placement,
    ReferenceElement,
    safePolygon,
    shift,
    useDismiss,
    useFloating,
    UseFloatingReturn,
    useFocus,
    useHover,
    useInteractions,
    useRole
} from "@floating-ui/react";
import { Dispatch, FocusEvent, SetStateAction, useCallback, useEffect, useRef } from "react";
import { useKeyboardClick } from "./useKeyboardClick";
import { OpenOnEnum } from "../../typings/TooltipProps";
interface FloatingProps {
    position: Placement;
    showTooltip: boolean;
    setShowTooltip: Dispatch<SetStateAction<boolean>>;
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
        onBlur: (event: FocusEvent<Element>) => void;
    };
    floatingFocusEvents: {
        onBlur: (event: FocusEvent<Element>) => void;
    };
}

const FOCUSABLE_SELECTOR = [
    "button:not([disabled])",
    "a[href]",
    "input:not([disabled]):not([type='hidden'])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])"
].join(",");

function contains(parent: Element | null | undefined, child: EventTarget | null): boolean {
    return !!parent && child instanceof Node && parent.contains(child);
}

type FloatingPropsReturn = Partial<UseFloatingReturn<ReferenceElement>> &
    Partial<InternalFloatingProps> &
    Partial<UseInteractionsReturn>;

export function useFloatingUI(props: FloatingProps): FloatingPropsReturn {
    const { position, showTooltip, setShowTooltip, arrowElement, openOn } = props;
    const elementsRef = useRef<{ reference: Element | null; floating: HTMLElement | null }>({
        reference: null,
        floating: null
    });

    const onOpenChange = useCallback(
        (open: boolean, _event?: Event, reason?: string): void => {
            const { reference, floating } = elementsRef.current;
            // Escape removes the tooltip content. If focus was inside it, the browser drops focus to the
            // top of the page, so move it back to the trigger first.
            if (!open && reason === "escape-key" && contains(floating, document.activeElement)) {
                reference?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus();
            }
            setShowTooltip(open);
        },
        [setShowTooltip]
    );

    const { refs, floatingStyles, context, middlewareData, placement } = useFloating({
        strategy: "fixed",
        placement: position,
        open: showTooltip,
        onOpenChange,
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
    const click = useKeyboardClick(context, { enabled: openOn === "click" });
    const dismiss = useDismiss(context, { outsidePress: true });
    const role = useRole(context, { role: "tooltip" });

    useEffect(() => {
        elementsRef.current = { reference: refs.domReference.current, floating: refs.floating.current };
    });

    const onShow = useCallback(() => setShowTooltip(true), [setShowTooltip]);
    // Keep the tooltip open while focus moves between the trigger and its content, so a keyboard user can
    // reach a button inside custom content. Close it when focus leaves both.
    const onFocusOut = useCallback(
        (event: FocusEvent<Element>) => {
            const next = event.relatedTarget;
            if (contains(refs.domReference.current, next) || contains(refs.floating.current, next)) {
                return;
            }
            setShowTooltip(false);
        },
        [refs, setShowTooltip]
    );
    const blurFocusEvents = { onFocus: onShow, onBlur: onFocusOut };
    const floatingFocusEvents = { onBlur: onFocusOut };

    const side = placement.split("-")[0];
    const alignment = placement.split("-")[1];
    const alignmentOffset =
        ["top", "bottom"].includes(side) && alignment === "start" ? (arrowElement?.offsetWidth ?? 0) : 0;
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
        floatingFocusEvents,
        floatingStyles,
        getFloatingProps,
        getReferenceProps,
        refs,
        staticSide
    };
}
