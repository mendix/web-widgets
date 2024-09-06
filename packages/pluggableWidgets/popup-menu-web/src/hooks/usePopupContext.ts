import { useContext } from "react";
import { PopupContext, PopupContextType } from "../components/PopupContext";

export const usePopupContext = (): PopupContextType => {
    const context = useContext(PopupContext);

    if (context == null) {
        throw new Error("Popup components must be wrapped in <PopupContext.Provider />");
    }

    return context;
};
