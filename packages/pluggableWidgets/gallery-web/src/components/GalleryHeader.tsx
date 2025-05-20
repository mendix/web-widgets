import { createElement, ReactElement } from "react";
import { useGalleryRootScope } from "../helpers/root-context";
import { getGlobalSortContext } from "@mendix/widget-plugin-sorting/context";

type GalleryHeaderProps = Omit<JSX.IntrinsicElements["div"], "ref">;

const SortAPI = getGlobalSortContext();

export function GalleryHeader(props: GalleryHeaderProps): ReactElement | null {
    const { children } = props;
    const scope = useGalleryRootScope();

    if (!children) {
        return null;
    }

    return (
        <SortAPI.Provider value={scope.rootStore.sortAPI}>
            <section {...props} className="widget-gallery-header widget-gallery-filter" />
        </SortAPI.Provider>
    );
}
