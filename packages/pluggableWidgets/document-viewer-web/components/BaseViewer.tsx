import React, { createElement, Fragment, PropsWithChildren, ReactElement } from "react";
import { useZoomScale } from "../utils/useZoomScale";
import { constructWrapperStyle, DimensionContainerProps } from "../utils/dimension";

interface BaseViewerProps extends PropsWithChildren, DimensionContainerProps {
    fileName: string;
    CustomControl?: React.ReactNode;
}

const BaseControlViewer = (props: BaseViewerProps): ReactElement => {
    const { fileName, CustomControl, children } = props;
    const wrapperStyle = constructWrapperStyle(props);
    return (
        <Fragment>
            <div className="widget-document-viewer-controls">
                <div className="widget-document-viewer-controls-left">{fileName}</div>
                <div className="widget-document-viewer-controls-icons">{CustomControl}</div>
            </div>
            <div className="widget-document-viewer-content" style={wrapperStyle}>
                {children}
            </div>
        </Fragment>
    );
};

const BaseViewer = (props: BaseViewerProps): ReactElement => {
    const { CustomControl, children } = props;
    const { zoomLevel, zoomIn, zoomOut } = useZoomScale();
    return (
        <BaseControlViewer
            {...props}
            CustomControl={
                <Fragment>
                    {CustomControl}
                    <div className="widget-document-viewer-zoom">
                        <button
                            onClick={zoomOut}
                            disabled={zoomLevel <= 0.3}
                            className="icons icon-ZoomOut btn btn-icon-only"
                            aria-label={"Go to previous page"}
                        ></button>
                        <button
                            onClick={zoomIn}
                            disabled={zoomLevel >= 10}
                            className="icons icon-ZoomIn btn btn-icon-only"
                            aria-label={"Go to previous page"}
                        ></button>
                    </div>
                </Fragment>
            }
        >
            <div
                className="widget-document-viewer-zoom-container"
                style={{ "--default-zoom-scale": zoomLevel } as React.CSSProperties}
            >
                {children}
            </div>
        </BaseControlViewer>
    );
};

export default BaseViewer;
export { BaseControlViewer };
