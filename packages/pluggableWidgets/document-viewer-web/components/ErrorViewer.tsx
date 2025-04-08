import { createElement, Fragment } from "react";
import { DocRendererElement } from "./documentRenderer";

const ErrorViewer: DocRendererElement = () => {
    return (
        <Fragment>
            <div className="widget-document-viewer-content">No document selected</div>
        </Fragment>
    );
};

ErrorViewer.contentTypes = [];

export default ErrorViewer;
