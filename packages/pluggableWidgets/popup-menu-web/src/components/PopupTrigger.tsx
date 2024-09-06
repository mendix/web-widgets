import { useMergeRefs } from "@floating-ui/react";
import { createElement, forwardRef, PropsWithChildren } from "react";
import { usePopupContext } from "../hooks/usePopupContext";

interface PopupTriggerProps extends PropsWithChildren {}

export const PopupTrigger = forwardRef<HTMLElement, React.HTMLProps<HTMLElement> & PopupTriggerProps>(
    function PopupTrigger({ children, ...props }, propRef) {
        const context = usePopupContext();
        const childrenRef = (children as any).ref;
        const ref = useMergeRefs([context.refs.setReference, propRef, childrenRef]);

        return (
            <div
                className={"popupmenu-trigger"}
                ref={ref}
                data-state={context.open ? "open" : "closed"}
                {...context.getReferenceProps(props)}
            >
                {children}
            </div>
        );
    }
);
