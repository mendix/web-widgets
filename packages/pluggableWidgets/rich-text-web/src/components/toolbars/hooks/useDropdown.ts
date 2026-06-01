import { useEffect, useRef, RefObject } from "react";
import { useFloating, offset, flip, shift, autoUpdate, Placement } from "@floating-ui/react";

export interface UseDropdownOptions {
    isOpen: boolean;
    onClose: () => void;
    placement?: Placement;
    offsetValue?: number;
    referenceElement?: HTMLElement | null;
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
    referenceElement
}: UseDropdownOptions): UseDropdownReturn {
    const ignoreClickRef = useRef<HTMLElement | null>(null);

    const { x, y, strategy, refs } = useFloating({
        placement,
        strategy: "fixed",
        middleware: [offset(offsetValue), flip(), shift({ padding: 8 })],
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
        }
    };
}
