import { useContext } from "react";
import { PopupContext } from "../components/PopupContext";
import { UsePopupReturn } from "./usePopup";

export const usePopupContext = (): UsePopupReturn => {
    const context = useContext(PopupContext);

    if (context == null) {
        throw new Error("Popup components must be wrapped in <PopupContext.Provider />");
    }

    return context;
};
