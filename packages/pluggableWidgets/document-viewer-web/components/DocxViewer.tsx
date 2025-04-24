import { parseAsync, renderDocument, WordDocument, Options } from "docx-preview";
import { createElement, useCallback, useEffect, useRef } from "react";
import { BaseControlViewer } from "./BaseViewer";
import { DocRendererElement, DocumentRendererProps, DocumentStatus } from "./documentRenderer";
import "./DocxViewer.scss";

const DOC_CONFIG: Partial<Options> = {
    className: "docx-viewer-content",
    ignoreWidth: true,
    ignoreLastRenderedPageBreak: false,
    inWrapper: false
};

const DocxViewer: DocRendererElement = (props: DocumentRendererProps) => {
    const { file, setDocumentStatus } = props;
    const localRef = useRef<HTMLDivElement>(null);
    const loadContent = useCallback(
        async (arrayBuffer: any) => {
            try {
                parseAsync(arrayBuffer, DOC_CONFIG)
                    .then((wordDocument: WordDocument) => {
                        if (localRef.current) {
                            // create new dummy stylecontainer to be ignored
                            const styleContainer = document.createElement("div");
                            renderDocument(wordDocument, localRef.current, styleContainer, DOC_CONFIG).catch(
                                (_error: any) => {
                                    setDocumentStatus(DocumentStatus.error);
                                }
                            );
                        }
                    })
                    .catch((_error: any) => {
                        setDocumentStatus(DocumentStatus.error);
                    });
            } catch (_error: any) {
                setDocumentStatus(DocumentStatus.error);
            }
        },
        [setDocumentStatus]
    );

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
    }, [file, file.status, file.value?.uri, loadContent]);

    return (
        <BaseControlViewer {...props} file={file}>
            <div className="docx-viewer-container" ref={localRef}></div>
        </BaseControlViewer>
    );
};

DocxViewer.contentTypes = [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-word",
    "application/vnd.ms-word.document.macroEnabled.12",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.template",
    "application/vnd.ms-word.template.macroEnabled.12",
    "application/vnd.ms-word.document.12",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/octet-stream"
];

DocxViewer.fileTypes = ["docx"];

export default DocxViewer;
