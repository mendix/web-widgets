import { createElement, PropsWithChildren, ReactElement } from "react";

export function GalleryTopBar(props: PropsWithChildren): ReactElement {
    return <div className="widget-gallery-top-bar">{props.children}</div>;
}
