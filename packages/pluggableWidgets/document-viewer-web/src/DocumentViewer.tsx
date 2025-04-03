import { createElement, ReactElement } from "react";
import { DocumentContext } from "../store";
import { DocumentViewerContainerProps } from "../typings/DocumentViewerProps";
import { useRendererSelector } from "../utils/useRendererSelector";
import "../ui/DocumentViewer.scss";
import classNames from "classnames";

export default function DocumentViewer(props: DocumentViewerContainerProps): ReactElement {
    const { CurrentRenderer } = useRendererSelector(props);

    return (
        <DocumentContext.Provider value={props}>
            <div className={classNames(props.class, "widget-document-viewer", "form-control")}>
                {CurrentRenderer && <CurrentRenderer {...props} />}
            </div>
        </DocumentContext.Provider>
    );
}
