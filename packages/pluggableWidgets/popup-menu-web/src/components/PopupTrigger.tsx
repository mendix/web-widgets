import { useMergeRefs } from "@floating-ui/react";
import { createElement, forwardRef, PropsWithChildren, ReactElement, RefObject } from "react";
import { usePopupContext } from "../hooks/usePopupContext";

export const PopupTrigger = forwardRef(
    ({ children }: PropsWithChildren, propRef: RefObject<HTMLDivElement>): ReactElement => {
        const { getReferenceProps, open, refs } = usePopupContext();
        const childrenRef = (children as any).ref;
        const ref = useMergeRefs([refs.setReference, propRef, childrenRef]);

        return (
            <div
                className={"popupmenu-trigger"}
                ref={ref}
                data-state={open ? "open" : "closed"}
                {...getReferenceProps?.({
                    onClick: e => {
                        e.stopPropagation();
                    }
                })}
            >
                {children}
            </div>
        );
    }
);
