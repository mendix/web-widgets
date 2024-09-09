import { createContext } from "react";
import { usePopup } from "../hooks/usePopup";

export type PopupContextType = ReturnType<typeof usePopup> & {
    setLabelId: React.Dispatch<React.SetStateAction<string | undefined>>;
    setDescriptionId: React.Dispatch<React.SetStateAction<string | undefined>>;
};

export type ContextType = PopupContextType | null;

export const PopupContext = createContext<ContextType>(null);