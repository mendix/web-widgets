import { useContext } from "react";
import { PopupContext } from "../components/PopupContext";

export const usePopupContext = () => {
    const context = useContext(PopupContext);

    if (context == null) {
        throw new Error("Popup components must be wrapped in <PopupContext.Provider />");
    }

    return context;
};
