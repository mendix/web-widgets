import { createElement, PropsWithChildren, ReactElement } from "react";

type GalleryHeaderProps = PropsWithChildren<{
    headerTitle?: string;
}>;

export function GalleryHeader(props: GalleryHeaderProps): ReactElement | null {
    const { children, headerTitle } = props;

    if (!children) {
        return null;
    }

    return (
        <section className="widget-gallery-header widget-gallery-filter" aria-label={headerTitle || "Gallery header"}>
            {children}
        </section>
    );
}
