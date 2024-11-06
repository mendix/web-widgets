import { createElement, PropsWithChildren, ReactElement } from "react";
import { PopupContext } from "../components/PopupContext";
import { PopupTrigger } from "../components/PopupTrigger";
import { usePopup } from "../hooks/usePopup";

export function PopupTriggerWithContext(props: PropsWithChildren): ReactElement {
    const popup = usePopup({ open: true, onOpenChange: jest.fn(), trigger: "onclick", clippingStrategy: "absolute" });

    return (
        <PopupContext.Provider value={popup}>
            <PopupTrigger {...props} />
        </PopupContext.Provider>
    );
}
