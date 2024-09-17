import { createContext } from "react";
import { UsePopupReturn } from "../hooks/usePopup";

export type ContextType = UsePopupReturn | null;

export const PopupContext = createContext<ContextType>(null);
