import { ReactNode, createElement } from "react";
import { DocumentViewerContainerProps } from "../typings/DocumentViewerProps";
import "./ui/DocumentViewer.scss";
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";

export function DocumentViewer(props: DocumentViewerContainerProps): ReactNode {
    if (props.file.status === "available" && props.file.value.uri) {
        const docs = [{ uri: props.file.value?.uri }];
        return <DocViewer pluginRenderers={DocViewerRenderers} documents={docs} />;
    }
    return (
        <div>
            <h1>File Unavailable</h1>
        </div>
    );
}
