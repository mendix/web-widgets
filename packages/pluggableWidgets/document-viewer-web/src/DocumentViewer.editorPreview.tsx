import { createElement, ReactElement } from "react";
import { DocumentViewerPreviewProps } from "typings/DocumentViewerProps";
import "../ui/DocumentViewer.scss";

export const preview = (props: DocumentViewerPreviewProps): ReactElement => {
    const { file } = props;
    return (
        <div className="widget-document-viewer">
            <div className="widget-document-viewer-content">{file ? `[${file}]` : "[No attribute selected]"}</div>
        </div>
    );
};
