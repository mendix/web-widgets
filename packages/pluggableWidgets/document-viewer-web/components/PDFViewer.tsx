import { createElement, Fragment, useCallback, useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { downloadFile } from "../utils/helpers";
import { useZoomScale } from "../utils/useZoomScale";
import BaseViewer from "./BaseViewer";
import { DocRendererElement, DocumentRendererProps, DocumentStatus } from "./documentRenderer";
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
const options = {
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
    standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts`
};

const PDFViewer: DocRendererElement = (props: DocumentRendererProps) => {
    const { file, setDocumentStatus } = props;
    const [numberOfPages, setNumberOfPages] = useState<number>(1);
    const { zoomLevel, zoomIn, zoomOut, reset } = useZoomScale();
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    const onDownloadClick = useCallback(() => {
        downloadFile(file.value?.uri);
    }, [file]);

    useEffect(() => {
        if (file.status === "available" && file.value.uri) {
            setPdfUrl(file.value.uri);
        }
    }, [file, file.status, file.value?.uri]);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
        setNumberOfPages(numPages);
    }

    if (!file.value?.uri) {
        return <div>No document selected</div>;
    }

    return (
        <BaseViewer
            {...props}
            fileName={file.value?.name || ""}
            CustomControl={
                <Fragment>
                    <div className="widget-document-viewer-pagination">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage <= 1}
                            className="icons icon-Left btn btn-icon-only"
                            aria-label={"Go to previous page"}
                            title={"Go to previous page"}
                        ></button>
                        <span>
                            {currentPage} / {numberOfPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, numberOfPages))}
                            className="icons icon-Right btn btn-icon-only"
                            aria-label={"Go to next page"}
                            title={"Go to next page"}
                        ></button>
                    </div>
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
            <Document
                file={pdfUrl}
                options={options}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={() => setDocumentStatus(DocumentStatus.error)}
            >
                <Page pageNumber={currentPage} scale={zoomLevel} />
            </Document>
        </BaseViewer>
    );
};

PDFViewer.contentTypes = ["application/pdf", "application/x-pdf", "application/acrobat", "text/pdf", "text/html"];

PDFViewer.fileTypes = ["pdf"];

export default PDFViewer;
