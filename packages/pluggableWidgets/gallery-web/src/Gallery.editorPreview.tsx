import { enableStaticRendering } from "mobx-react-lite";
enableStaticRendering(true);

import { createElement, ReactElement } from "react";
import { GalleryPreviewProps } from "../typings/GalleryProps";
import "./ui/GalleryPreview.scss";

function Preview(props: GalleryPreviewProps): ReactElement {
    return (
        <div>
            FIX ME: Preview for gallery
            <div>
                <props.content.renderer>
                    <div />
                </props.content.renderer>
            </div>
        </div>
    );
}

export function preview(props: GalleryPreviewProps): ReactElement {
    return createElement(Preview, props);
}
