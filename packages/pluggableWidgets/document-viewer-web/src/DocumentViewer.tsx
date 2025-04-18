import classNames from "classnames";
import { createElement, ReactElement } from "react";
import { DocumentViewerContainerProps } from "../typings/DocumentViewerProps";
import "../ui/documentViewer.scss";
import "../ui/documentViewerIcons.scss";
import { constructWrapperStyle } from "../utils/dimension";
import { useRendererSelector } from "../utils/useRendererSelector";

export default function DocumentViewer(props: DocumentViewerContainerProps): ReactElement {
    const { CurrentRenderer, props: rendererProps } = useRendererSelector(props);

    const wrapperStyle = constructWrapperStyle(props);
    return (
        <div className={classNames(props.class, "widget-document-viewer", "form-control")} style={wrapperStyle}>
            {CurrentRenderer && <CurrentRenderer {...rendererProps} />}
        </div>
    );
}
