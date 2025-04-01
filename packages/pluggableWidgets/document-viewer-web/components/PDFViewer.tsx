import { createElement, Fragment, useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { DocumentViewerContainerProps } from "../typings/DocumentViewerProps";
import { DocRendererElement } from "./documentRenderer";
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
const options = {
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
    standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts`
};

const PDFViewer: DocRendererElement = (props: DocumentViewerContainerProps) => {
    const { file } = props;
    const [numberOfPages, setNumberOfPages] = useState<number>(1);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    if (!file.value?.uri) {
        return <div>No document selected</div>;
    }

    useEffect(() => {
        if (file.status === "available" && file.value.uri) {
            setPdfUrl(file.value.uri);
        }
    }, [file, file.status, file.value.uri]);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
        setNumberOfPages(numPages);
    }

    return (
        <Fragment>
            <div className="widget-document-viewer-controls">
                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage <= 1}>
                    Previous
                </button>
                <span>
                    Page {currentPage} of {numberOfPages}
                </span>
                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, numberOfPages))}>Next</button>
            </div>
            <div className="widget-document-viewer-content">
                {pdfUrl && (
                    <Document file={pdfUrl} options={options} onLoadSuccess={onDocumentLoadSuccess}>
                        <Page pageNumber={currentPage} />
                    </Document>
                )}
            </div>
        </Fragment>
    );
};

PDFViewer.contentTypes = ["application/pdf", "application/x-pdf", "application/acrobat", "text/pdf"];

export default PDFViewer;
