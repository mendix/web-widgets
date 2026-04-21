import { useMergeRefs } from "@floating-ui/react";
import { cloneElement, forwardRef, PropsWithChildren, ReactElement, RefObject } from "react";
import { usePopupContext } from "../hooks/usePopupContext";

export const PopupTrigger = forwardRef(
    ({ children }: PropsWithChildren, propRef: RefObject<HTMLDivElement>): ReactElement => {
        const { getReferenceProps, open, refs } = usePopupContext();
        const childElement = children as ReactElement;
        const childrenRef = (childElement as any).ref;
        const ref = useMergeRefs([refs.setReference, propRef]);

        // Clone the child element and apply ARIA attributes directly to it
        // This ensures screen readers see the attributes on the actual button element
        // while keeping the wrapper for backwards compatibility
        const enhancedChild = cloneElement(childElement, {
            ref: childrenRef,
            "aria-haspopup": "menu",
            "aria-expanded": open
        } as any);

        return (
            <div
                className="popupmenu-trigger"
                ref={ref}
                data-state={open ? "open" : "closed"}
                {...getReferenceProps?.({
                    onClick: e => {
                        e.stopPropagation();
                    }
                })}
            >
                {enhancedChild}
            </div>
        );
    }
);
