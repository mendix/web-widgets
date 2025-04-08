import { createElement, Fragment, useContext } from "react";
import { DocumentContext } from "../store";
import { DocRendererElement } from "./documentRenderer";

const ErrorViewer: DocRendererElement = () => {
    const props = useContext(DocumentContext);
    return (
        <Fragment>
            <div className="widget-document-viewer-content">No document selected</div>
        </Fragment>
    );
};

ErrorViewer.contentTypes = [];

export default ErrorViewer;
