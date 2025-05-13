import { createContext, useContext } from "react";
import { GalleryStore } from "../stores/GalleryStore";

export interface GalleryRootScope {
    rootStore: GalleryStore;
}

export const GalleryContext = createContext<GalleryRootScope | null>(null);

export const useGalleryRootScope = (): GalleryRootScope => {
    const contextValue = useContext(GalleryContext);
    if (!contextValue) {
        throw new Error("useGalleryRootContext must be used within a root context provider");
    }
    return contextValue;
};
