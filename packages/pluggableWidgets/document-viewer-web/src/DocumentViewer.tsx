import { ReactNode, createElement } from "react";
import { DocumentViewerContainerProps } from "../typings/DocumentViewerProps";
import "./ui/DocumentViewer.scss";

export function DocumentViewer(_props: DocumentViewerContainerProps): ReactNode {
    console.log("props", _props);

    return <div className="widget-document-viewer"></div>;
}
