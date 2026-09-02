import { useFloating, offset, flip, shift, size, autoUpdate, Placement } from "@floating-ui/react";
import { useEffect, useRef, useState, RefObject } from "react";

/**
 * Smallest height an auto-sized floating element is allowed to shrink to. Without a floor, a
 * trigger near the viewport edge yields an `availableHeight` of a few pixels and the element
 * collapses into an unusable sliver.
 */
export const MIN_AVAILABLE_HEIGHT = 200;

export interface UseDropdownOptions {
    isOpen: boolean;
    onClose: () => void;
    placement?: Placement;
    offsetValue?: number;
    referenceElement?: HTMLElement | null;
    /**
     * Measure the space left at the resolved placement and report it as `availableHeight`, so the
     * caller can cap its own scroll region. Off by default: the toolbar popovers already bound
     * themselves in CSS and must keep their current behaviour.
     */
    trackAvailableHeight?: boolean;
}

export interface UseDropdownReturn {
    refs: {
        reference: RefObject<HTMLElement | null>;
        floating: RefObject<HTMLElement | null>;
        setReference: (node: HTMLElement | null) => void;
        setFloating: (node: HTMLElement | null) => void;
    };
    floatingStyles: {
        position: "fixed" | "absolute";
        top: number;
        left: number;
    };
    /**
     * Height available at the resolved placement, floored at `MIN_AVAILABLE_HEIGHT`. Only produced
     * when `trackAvailableHeight` is set; `undefined` otherwise.
     */
    availableHeight?: number;
}

/**
 * Common hook for dropdown/popover positioning and click-outside handling
 * Uses Floating UI for positioning and handles click-outside to close
 */
export function useDropdown({
    isOpen,
    onClose,
    placement = "bottom-start",
    offsetValue = 4,
    referenceElement,
    trackAvailableHeight = false
}: UseDropdownOptions): UseDropdownReturn {
    const ignoreClickRef = useRef<HTMLElement | null>(null);
    const [availableHeight, setAvailableHeight] = useState<number | undefined>(undefined);

    const { x, y, strategy, refs } = useFloating({
        placement,
        strategy: "fixed",
        // `size` runs last on purpose: it must measure the placement `flip` and `shift` settled on,
        // not the requested one.
        middleware: [
            offset(offsetValue),
            flip(),
            shift({ padding: 8 }),
            ...(trackAvailableHeight
                ? [
                      size({
                          padding: 8,
                          apply({ availableHeight: available }) {
                              setAvailableHeight(Math.max(Math.floor(available), MIN_AVAILABLE_HEIGHT));
                          }
                      })
                  ]
                : [])
        ],
        whileElementsMounted: autoUpdate,
        open: isOpen
    });

    // Set reference element if provided externally
    useEffect(() => {
        if (referenceElement && refs.reference.current !== referenceElement) {
            refs.setReference(referenceElement);
            ignoreClickRef.current = referenceElement;
        }
    }, [referenceElement, refs]);

    // Handle click outside to close
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event: MouseEvent): void => {
            const target = event.target as Node;
            const floatingEl = refs.floating.current;
            const referenceEl = refs.reference.current || ignoreClickRef.current;

            // Close if click is outside both the dropdown and the reference element
            if (
                floatingEl &&
                floatingEl instanceof HTMLElement &&
                !floatingEl.contains(target) &&
                referenceEl &&
                referenceEl instanceof HTMLElement &&
                !referenceEl.contains(target)
            ) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose, refs.floating, refs.reference]);

    return {
        refs: {
            reference: refs.reference as RefObject<HTMLElement | null>,
            floating: refs.floating as RefObject<HTMLElement | null>,
            setReference: refs.setReference,
            setFloating: refs.setFloating
        },
        floatingStyles: {
            position: strategy,
            top: y ?? 0,
            left: x ?? 0
        },
        availableHeight
    };
}
