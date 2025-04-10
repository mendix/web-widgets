import { createElement, Fragment, useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { DocumentViewerContainerProps } from "../typings/DocumentViewerProps";
import { DocRendererElement } from "./documentRenderer";
import { useZoomScale } from "../utils/useZoomScale";
import BaseViewer from "./BaseViewer";
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
const options = {
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
    standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts`
};

const PDFViewer: DocRendererElement = (props: DocumentViewerContainerProps) => {
    const { file } = props;
    const [numberOfPages, setNumberOfPages] = useState<number>(1);
    const { zoomLevel, zoomIn, zoomOut } = useZoomScale();
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

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
                        ></button>
                        <span>
                            {currentPage} / {numberOfPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, numberOfPages))}
                            className="icons icon-Right btn btn-icon-only"
                            aria-label={"Go to next page"}
                        ></button>
                    </div>
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
            <Document file={pdfUrl} options={options} onLoadSuccess={onDocumentLoadSuccess}>
                <Page pageNumber={currentPage} scale={zoomLevel} />
            </Document>
        </BaseViewer>
    );
};

PDFViewer.contentTypes = ["application/pdf", "application/x-pdf", "application/acrobat", "text/pdf", "text/html"];

PDFViewer.fileTypes = ["pdf", "pdfx"];

export default PDFViewer;
