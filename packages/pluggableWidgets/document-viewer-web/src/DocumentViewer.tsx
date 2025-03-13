import { createElement, ReactElement, useState } from "react";
import { DocumentViewerContainerProps } from "../typings/DocumentViewerProps";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
const options = {
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
    standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts`
};

export default function DocumentViewer(props: DocumentViewerContainerProps): ReactElement {
    const [numberOfPages, setNumberOfPages] = useState<number>(1);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    // Load PDF when URL changes
    if (props.file.value?.uri && !pdfUrl) {
        setPdfUrl(props.file.value.uri);
    }

    if (!props.file.value?.uri) {
        return <div>No document selected</div>;
    }

    function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
        setNumberOfPages(numPages);
    }

    return (
        <div className="widget-document-viewer">
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
                <Document file={pdfUrl} options={options} onLoadSuccess={onDocumentLoadSuccess}>
                    <Page pageNumber={currentPage} />
                </Document>
            </div>
        </div>
    );
}
