import { createElement, Fragment, useCallback, useEffect, useState } from "react";
import mammoth from "mammoth";
import { DocumentViewerContainerProps } from "typings/DocumentViewerProps";
import { DocRendererElement } from "./documentRenderer";

const DocxViewer: DocRendererElement = (props: DocumentViewerContainerProps) => {
    const { file } = props;
    const [docxHtml, setDocxHtml] = useState<string | null>(null);

    const loadContent = useCallback(async (arrayBuffer: any) => {
        try {
            mammoth
                .convertToHtml(
                    { arrayBuffer: arrayBuffer },
                    {
                        includeDefaultStyleMap: true
                    }
                )
                .then(result => {
                    if (result) {
                        setDocxHtml(result.value);
                    }
                });
        } catch (error) {}
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;
        if (file.status === "available" && file.value.uri) {
            fetch(file.value.uri, { method: "GET", signal })
                .then(res => res.arrayBuffer())
                .then(response => {
                    loadContent(response);
                });
        }

        return () => {
            controller.abort();
        };
    }, [file, file?.status, file?.value?.uri]);

    return (
        <Fragment>
            {docxHtml && (
                <div
                    // className={styles['document-container']}
                    style={{
                        width: 1 * 100 + "%",
                        height: "85%",
                        overflow: "auto"
                    }}
                    dangerouslySetInnerHTML={{ __html: docxHtml }}
                >
                    {/* {docHtmlStr} */}
                </div>
            )}
        </Fragment>
    );
};

DocxViewer.contentTypes = [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "application/vnd.ms-word",
    "application/vnd.ms-word.document.macroEnabled.12",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.template",
    "application/vnd.ms-word.template.macroEnabled.12",
    "application/vnd.ms-word.document.12",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/octet-stream"
];

export default DocxViewer;
