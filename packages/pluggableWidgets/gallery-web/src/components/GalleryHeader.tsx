import { createElement, ReactElement } from "react";

type GalleryHeaderProps = Omit<JSX.IntrinsicElements["div"], "ref">;

export function GalleryHeader(props: GalleryHeaderProps): ReactElement | null {
    const { children } = props;

    if (!children) {
        return null;
    }

    return <section {...props} className="widget-gallery-header widget-gallery-filter" />;
}
