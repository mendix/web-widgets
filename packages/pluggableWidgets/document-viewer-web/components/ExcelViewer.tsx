import { createElement, useCallback, useEffect, useState } from "react";
import { read, utils } from "xlsx";
import { BaseControlViewer } from "./BaseViewer";
import { DocRendererElement, DocumentRendererProps, DocumentStatus } from "./documentRenderer";

const ExcelViewer: DocRendererElement = (props: DocumentRendererProps) => {
    const { file, setDocumentStatus } = props;
    const [xlsxHtml, setXlsxHtml] = useState<string | null>(null);

    const loadContent = useCallback(
        async (arrayBuffer: any) => {
            try {
                const wb = read(arrayBuffer);
                const sheet = wb.Sheets[wb.SheetNames[0]];
                const html = utils.sheet_to_html(sheet);
                setXlsxHtml(html);
            } catch (_error) {
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
            {xlsxHtml && <div className="xlsx-viewer-content" dangerouslySetInnerHTML={{ __html: xlsxHtml }}></div>}
        </BaseControlViewer>
    );
};

ExcelViewer.contentTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel.sheet.macroEnabled.12",
    "application/vnd.ms-excel.sheet.binary.macroEnabled.12",
    "application/vnd.ms-excel.template.macroEnabled.12",
    "application/vnd.ms-excel.addin.macroEnabled.12",
    "application/octet-stream"
];

ExcelViewer.fileTypes = ["xlsx"];

export default ExcelViewer;
