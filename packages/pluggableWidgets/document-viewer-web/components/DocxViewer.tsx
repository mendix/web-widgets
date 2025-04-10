import mammoth from "mammoth";
import { createElement, useCallback, useEffect, useState } from "react";
import { DocumentViewerContainerProps } from "../typings/DocumentViewerProps";
import { BaseControlViewer } from "./BaseViewer";
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
                .then((result: any) => {
                    if (result) {
                        setDocxHtml(result.value);
                    }
                });
        } catch (error) {
            setDocxHtml(`<div>Error loading file : ${error}</div>`);
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;
        if (file.status === "available" && file.value.uri) {
            console.log("fetch file", file.value.uri);
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
        <BaseControlViewer {...props} fileName={file.value?.name || ""}>
            {docxHtml && <div className="docx-viewer-content" dangerouslySetInnerHTML={{ __html: docxHtml }}></div>}
        </BaseControlViewer>
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

DocxViewer.fileTypes = ["docx"];

export default DocxViewer;
