import { createContext } from "react";
import { usePopup } from "../hooks/usePopup";

export type ContextType =
    | (ReturnType<typeof usePopup> & {
          setLabelId: React.Dispatch<React.SetStateAction<string | undefined>>;
          setDescriptionId: React.Dispatch<React.SetStateAction<string | undefined>>;
      })
    | null;

export const PopupContext = createContext<ContextType>(null);
