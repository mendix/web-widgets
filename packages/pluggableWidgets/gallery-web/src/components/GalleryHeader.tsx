import { createElement, Fragment, PropsWithChildren, ReactElement } from "react";

interface GalleryHeaderProps extends PropsWithChildren {
    headerTitle?: string;
}

export function GalleryHeader(props: GalleryHeaderProps): ReactElement | null {
    const { children, headerTitle } = props;

    if (!children) {
        return <Fragment />;
    }

    return (
        <section className="widget-gallery-header widget-gallery-filter" aria-label={headerTitle || "Gallery header"}>
            {children}
        </section>
    );
}
