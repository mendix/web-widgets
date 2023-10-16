import { createElement, ReactElement, ReactNode } from "react";

export function GalleryTopBar(props: { children: ReactNode }): ReactElement {
    return <div className="widget-gallery-top-bar">{props.children}</div>;
}
