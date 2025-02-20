import { createElement, ReactElement, useState } from "react";
import { DocumentViewerContainerProps } from "../typings/DocumentViewerProps";
import * as pdfjsLib from "pdfjs-dist";

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function DocumentViewer(props: DocumentViewerContainerProps): ReactElement {
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);

    const loadPDF = async (url: string): Promise<void> => {
        try {
            const doc = await pdfjsLib.getDocument(url).promise;
            setPdfDoc(doc);
            setNumPages(doc.numPages);
        } catch (error) {
            console.error("Error loading PDF:", error);
        }
    };

    const renderPage = async (pageNum: number): Promise<void> => {
        if (!pdfDoc) {
            return;
        }

        try {
            const page = await pdfDoc.getPage(pageNum);
            const canvas = document.getElementById(`page-${pageNum}`) as HTMLCanvasElement;
            const context = canvas.getContext("2d");

            if (!context) {
                return;
            }

            const viewport = page.getViewport({ scale: 1.0 });
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({
                canvasContext: context,
                viewport
            }).promise;
        } catch (error) {
            console.error("Error rendering page:", error);
        }
    };

    // Load PDF when URL changes
    if (props.file.value?.uri && (!pdfDoc || pdfDoc._transport.source.url !== props.file.value.uri)) {
        loadPDF(props.file.value.uri);
    }

    // Render current page when it changes
    if (pdfDoc) {
        renderPage(currentPage);
    }

    if (!props.file.value?.uri) {
        return <div>No document selected</div>;
    }

    return (
        <div className="widget-document-viewer">
            <div className="widget-document-viewer-controls">
                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage <= 1}>
                    Previous
                </button>
                <span>
                    Page {currentPage} of {numPages}
                </span>
                <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, numPages))}
                    disabled={currentPage >= numPages}
                >
                    Next
                </button>
            </div>
            <div className="widget-document-viewer-content">
                <canvas id={`page-${currentPage}`} />
            </div>
        </div>
    );
}
