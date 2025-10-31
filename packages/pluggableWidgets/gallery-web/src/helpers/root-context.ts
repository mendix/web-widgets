import { SelectionCounterViewModel } from "@mendix/widget-plugin-grid/main";
import { SelectActionHandler, SelectionHelper } from "@mendix/widget-plugin-grid/selection";
import { createContext, useContext } from "react";
import { GalleryStore } from "../stores/GalleryStore";

export interface GalleryRootScope {
    rootStore: GalleryStore;
    selectionCountStore: SelectionCounterViewModel;
    selectionHelper: SelectionHelper | undefined;
    itemSelectHelper: SelectActionHandler;
}

export const GalleryContext = createContext<GalleryRootScope | null>(null);

export const useGalleryRootScope = (): GalleryRootScope => {
    const contextValue = useContext(GalleryContext);
    if (!contextValue) {
        throw new Error("useGalleryRootContext must be used within a root context provider");
    }
    return contextValue;
};
