import { ReactElement } from "react";
import { useMainGate } from "../model/hooks/injection-hooks";

export function GalleryHeader(): ReactElement | null {
    const { filtersPlaceholder } = useMainGate().props;

    if (!filtersPlaceholder) {
        return null;
    }

    return <section className="widget-gallery-header widget-gallery-filter">{filtersPlaceholder}</section>;
}
