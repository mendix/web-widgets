import { useContext } from "react";
import { UsePopupReturn } from "./usePopup";
import { PopupContext } from "../components/PopupContext";

export const usePopupContext = (): UsePopupReturn => {
    const context = useContext(PopupContext);

    if (context == null) {
        throw new Error("Popup components must be wrapped in <PopupContext.Provider />");
    }

    return context;
};
