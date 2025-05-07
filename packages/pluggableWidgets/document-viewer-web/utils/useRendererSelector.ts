import { useEffect, useState } from "react";

import { DocumentRenderers } from "../components";
import { DocRendererElement, DocumentRendererProps, DocumentStatus } from "../components/documentRenderer";
import ErrorViewer from "../components/ErrorViewer";
import { DocumentViewerContainerProps } from "../typings/DocumentViewerProps";
interface DocumentRenderer {
    CurrentRenderer: DocRendererElement;
    props: DocumentRendererProps;
}

export function useRendererSelector(props: DocumentViewerContainerProps): DocumentRenderer {
    const { file } = props;
    const [documentStatus, setDocumentStatus] = useState<DocumentStatus>(DocumentStatus.loading);
    const [component, setComponent] = useState<DocRendererElement>(() => ErrorViewer);
    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;
        if (file.status === "available" && file.value.uri) {
            fetch(file.value.uri, { method: "HEAD", signal }).then(response => {
                const contentTypeRaw = response.headers.get("content-type");
                const contentTypes = contentTypeRaw?.split(";") || [];
                const contentType = contentTypes.length ? contentTypes[0] : undefined;
                if (contentType) {
                    const selectedRenderer: DocRendererElement[] = [];
                    DocumentRenderers.forEach(renderer => {
                        if (renderer.contentTypes.includes(contentType)) {
                            selectedRenderer.push(renderer);
                        } else {
                            renderer.contentTypes.forEach(type => {
                                if (contentType.match(type)) {
                                    selectedRenderer.push(renderer);
                                }
                            });
                        }
                    });
                    if (selectedRenderer.length > 1) {
                        selectedRenderer.forEach(renderer => {
                            if (!renderer.fileTypes.includes(file.value?.name?.split(".").pop()?.toLowerCase() || "")) {
                                selectedRenderer.splice(selectedRenderer.indexOf(renderer), 1);
                            }
                        });
                    }
                    if (selectedRenderer.length > 0) {
                        setComponent(() => selectedRenderer[0]);
                    } else {
                        setDocumentStatus(DocumentStatus.error);
                    }
                }
            });
        }

        return () => {
            controller.abort();
        };
    }, [file, file?.status, file?.value?.uri]);

    useEffect(() => {
        if (documentStatus === DocumentStatus.error) {
            setComponent(() => ErrorViewer);
        }
    }, [documentStatus]);

    return { CurrentRenderer: component, props: { ...props, setDocumentStatus } };
}
