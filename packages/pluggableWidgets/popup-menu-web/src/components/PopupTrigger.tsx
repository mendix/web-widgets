import { useMergeRefs } from "@floating-ui/react";
import { forwardRef, PropsWithChildren, ReactElement, RefObject, useEffect, useRef } from "react";
import { usePopupContext } from "../hooks/usePopupContext";

export const PopupTrigger = forwardRef(
    ({ children }: PropsWithChildren, propRef: RefObject<HTMLDivElement>): ReactElement => {
        const { getReferenceProps, open, refs } = usePopupContext();
        const innerRef = useRef<HTMLDivElement>(null);
        const wrapperRef = useMergeRefs([refs.setReference, propRef, innerRef]);

        // Apply ARIA attributes to the first interactive element inside the trigger
        // Uses DOM manipulation since Mendix widgets don't forward arbitrary props
        useEffect(() => {
            const interactiveElement = innerRef.current?.querySelector<HTMLElement>(
                "button, a, [role='button'], input"
            );

            if (interactiveElement) {
                interactiveElement.setAttribute("aria-haspopup", "menu");
                interactiveElement.setAttribute("aria-expanded", String(open));
            }
        }, [open]);

        return (
            <div
                className="popupmenu-trigger"
                ref={wrapperRef}
                data-state={open ? "open" : "closed"}
                {...getReferenceProps?.({ onClick: e => e.stopPropagation() })}
            >
                {children}
            </div>
        );
    }
);
