import { createElement, ReactElement } from "react";
import { DocumentContext } from "../store";
import { DocumentViewerContainerProps } from "../typings/DocumentViewerProps";
import { useRendererSelector } from "../utils/useRendererSelector";

export default function DocumentViewer(props: DocumentViewerContainerProps): ReactElement {
    const { CurrentRenderer } = useRendererSelector(props);

    return (
        <DocumentContext.Provider value={props}>
            <div className="widget-document-viewer">{CurrentRenderer && <CurrentRenderer {...props} />}</div>
        </DocumentContext.Provider>
    );
}
