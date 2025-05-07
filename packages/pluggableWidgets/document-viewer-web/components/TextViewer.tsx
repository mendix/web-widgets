import { createElement, useEffect, useState } from "react";
import { BaseControlViewer } from "./BaseViewer";
import { DocRendererElement, DocumentRendererProps, DocumentStatus } from "./documentRenderer";

const TextViewer: DocRendererElement = (props: DocumentRendererProps) => {
    const { file, setDocumentStatus } = props;
    const [text, setText] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;
        if (file.status === "available" && file.value.uri) {
            fetch(file.value.uri, { method: "GET", signal })
                .then(res => res.text())
                .then(response => {
                    setText(response);
                })
                .catch(() => {
                    setDocumentStatus(DocumentStatus.error);
                });
        }

        return () => {
            controller.abort();
        };
    }, [file, file.status, file.value?.uri, setDocumentStatus]);

    return (
        <BaseControlViewer {...props} file={file}>
            <pre className="text-content">{text}</pre>
        </BaseControlViewer>
    );
};

TextViewer.contentTypes = ["text/plain", "text/csv", "application/json"];

TextViewer.fileTypes = [
    "txt",
    "csv",
    "json",
    "text",
    "log",
    "xml",
    "html",
    "htm",
    "css",
    "js",
    "jsx",
    "ts",
    "tsx",
    "svg"
];

export default TextViewer;
