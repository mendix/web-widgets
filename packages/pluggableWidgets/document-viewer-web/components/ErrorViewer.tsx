import { createElement, useCallback } from "react";
import { DocRendererElement, DocumentRendererProps } from "./documentRenderer";
import BaseViewer from "./BaseViewer";
import { downloadFile } from "../utils/helpers";

const ErrorViewer: DocRendererElement = (props: DocumentRendererProps) => {
    const { file } = props;
    const onDownloadClick = useCallback(() => {
        downloadFile(file.value?.uri);
    }, [file]);

    return (
        <BaseViewer
            {...props}
            fileName={file.value?.name || ""}
            CustomControl={
                <button
                    onClick={onDownloadClick}
                    className="icons icon-Download btn btn-icon-only"
                    aria-label={"download"}
                ></button>
            }
        >
            {file.status === "available" ? (
                <div>{"Unsupported document type"}</div>
            ) : (
                <div className="widget-document-viewer-loading"></div>
            )}
        </BaseViewer>
    );
};

ErrorViewer.contentTypes = [];
ErrorViewer.fileTypes = [];

export default ErrorViewer;
