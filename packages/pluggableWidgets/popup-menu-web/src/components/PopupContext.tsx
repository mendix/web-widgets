import { createContext, RefObject } from "react";
import { UsePopupReturn } from "../hooks/usePopup";

export type ContextType = UsePopupReturn | null;

export const PopupContext = createContext<ContextType>(null);

export interface SubmenuHandle {
    open(): void;
    close(): void;
    isOpen: boolean;
}

export interface MenuItemContextType {
    /** The parent menu item `<li>`, focused when the submenu closes. */
    itemRef: RefObject<HTMLLIElement | null>;
    /** Links a nested Pop-up Menu to this item. Returns an unregister function. */
    registerSubmenu(id: string, handle: SubmenuHandle): () => void;
}

export const MenuItemContext = createContext<MenuItemContextType | null>(null);
