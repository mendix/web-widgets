import { useEffect, useState } from "react";

import { DocumentRenderers } from "../components";
import { DocRendererElement } from "../components/documentRenderer";
import ErrorViewer from "../components/ErrorViewer";
import { DocumentViewerContainerProps } from "../typings/DocumentViewerProps";

interface DocumentRenderer {
    CurrentRenderer: DocRendererElement;
}

export function useRendererSelector(props: DocumentViewerContainerProps): DocumentRenderer {
    const { file } = props;
    const [component, setComponent] = useState<DocRendererElement>(() => ErrorViewer);
    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;
        if (file.status === "available" && file.value.uri) {
            fetch(file.value.uri, { method: "HEAD", signal }).then(response => {
                const contentTypeRaw = response.headers.get("content-type");
                const contentTypes = contentTypeRaw?.split(";") || [];
                const contentType = contentTypes.length ? contentTypes[0] : undefined;

                console.log("contentType", contentType);
                if (contentType) {
                    const selectedRenderer: DocRendererElement[] = [];
                    DocumentRenderers.forEach(renderer => {
                        if (renderer.contentTypes.includes(contentType)) {
                            selectedRenderer.push(renderer);
                        }
                    });
                    if (selectedRenderer.length > 1) {
                        selectedRenderer.forEach(renderer => {
                            if (!renderer.fileTypes.includes(file.value?.name?.split(".").pop()?.toLowerCase() || "")) {
                                selectedRenderer.splice(selectedRenderer.indexOf(renderer), 1);
                            }
                        });
                    }
                    console.log("selectedRenderer", selectedRenderer);
                    if (selectedRenderer.length > 0) {
                        setComponent(() => selectedRenderer[0]);
                    }
                }
            });
        }

        return () => {
            controller.abort();
        };
    }, [file, file?.status, file?.value?.uri]);
    return { CurrentRenderer: component };
}
