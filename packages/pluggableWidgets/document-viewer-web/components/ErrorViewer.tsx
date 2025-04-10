import { createElement } from "react";
import { DocRendererElement } from "./documentRenderer";

const ErrorViewer: DocRendererElement = () => {
    return <div className="widget-document-viewer-content">No document selected</div>;
};

ErrorViewer.contentTypes = [];
ErrorViewer.fileTypes = [];

export default ErrorViewer;
