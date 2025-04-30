import React, { createElement, Fragment, PropsWithChildren, ReactElement, useCallback } from "react";
import { useZoomScale } from "../utils/useZoomScale";
import { DocumentViewerContainerProps } from "typings/DocumentViewerProps";
import { downloadFile } from "../utils/helpers";

type FileFormat = {
    status: "available";
    value: {
        uri: string;
        name: string;
    };
};

interface BaseControlViewerProps extends PropsWithChildren {
    file: DocumentViewerContainerProps["file"] | FileFormat;
    CustomControl?: React.ReactNode;
}

interface BaseViewerProps extends PropsWithChildren {
    fileName: string;
    CustomControl?: React.ReactNode;
}

const BaseViewer = (props: BaseViewerProps): ReactElement => {
    const { fileName, CustomControl, children } = props;
    return (
        <Fragment>
            <div className="widget-document-viewer-controls">
                <div className="widget-document-viewer-controls-left">
                    <div className="document-title">{fileName}</div>
                </div>
                <div className="widget-document-viewer-controls-icons">{CustomControl}</div>
            </div>
            <div className="widget-document-viewer-content">{children}</div>
        </Fragment>
    );
};

const BaseControlViewer = (props: BaseControlViewerProps): ReactElement => {
    const { CustomControl, children, file } = props;
    const { zoomLevel, zoomIn, zoomOut, reset } = useZoomScale();
    const onDownloadClick = useCallback(() => {
        downloadFile(file.value?.uri);
    }, [file]);

    return (
        <BaseViewer
            fileName={file.value?.name || ""}
            CustomControl={
                <Fragment>
                    {CustomControl}
                    <button
                        onClick={onDownloadClick}
                        className="icons icon-Download btn btn-icon-only"
                        aria-label={"Download"}
                        title={"Download"}
                    ></button>
                    <div className="widget-document-viewer-zoom">
                        <button
                            onClick={zoomOut}
                            disabled={zoomLevel <= 0.3}
                            className="icons icon-ZoomOut btn btn-icon-only"
                            aria-label={"Zoom out"}
                            title={"Zoom out"}
                        ></button>
                        <button
                            onClick={zoomIn}
                            disabled={zoomLevel >= 10}
                            className="icons icon-ZoomIn btn btn-icon-only"
                            aria-label={"Zoom in"}
                            title={"Zoom in"}
                        ></button>
                        <button
                            onClick={reset}
                            disabled={zoomLevel >= 10}
                            className="icons icon-FitToWidth btn btn-icon-only"
                            aria-label={"Fit to width"}
                            title={"Fit to width"}
                        ></button>
                    </div>
                </Fragment>
            }
        >
            <div
                className="widget-document-viewer-zoom-container"
                style={{ "--current-zoom-scale": zoomLevel } as React.CSSProperties}
            >
                {children}
            </div>
        </BaseViewer>
    );
};

export default BaseViewer;
export { BaseControlViewer };
