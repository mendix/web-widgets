import {
    ChangeEvent,
    FormEvent,
    Fragment,
    KeyboardEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { downloadFile } from "../utils/helpers";
import { usePDFHighlightPositions } from "../utils/usePDFHighlightPositions";
import { usePDFSearch } from "../utils/usePDFSearch";
import { useZoomScale } from "../utils/useZoomScale";
import BaseViewer from "./BaseViewer";
import { DocRendererElement, DocumentRendererProps, DocumentStatus } from "./documentRenderer";
import { If } from "@mendix/widget-plugin-component-kit/If";
const options = {
    cMapUrl: "/widgets/com/mendix/shared/pdfjs/cmaps/",
    standardFontDataUrl: "/widgets/com/mendix/shared/pdfjs/standard_fonts"
};

const PDFViewer: DocRendererElement = (props: DocumentRendererProps) => {
    const { file, setDocumentStatus, pdfjsWorkerUrl } = props;
    pdfjs.GlobalWorkerOptions.workerSrc = useMemo(() => {
        if (pdfjsWorkerUrl?.status === "available") {
            if (pdfjsWorkerUrl?.value) {
                return pdfjsWorkerUrl.value;
            } else {
                return `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
            }
        } else if (pdfjsWorkerUrl?.status === "unavailable") {
            setDocumentStatus({
                status: DocumentStatus.error,
                message: "Failed to load PDF document : pdfjsWorker unavailable"
            });
            return ""; // no worker;
        } else {
            return ""; // no worker;
        }
    }, [pdfjsWorkerUrl, setDocumentStatus]);

    const [numberOfPages, setNumberOfPages] = useState<number>(1);
    const { zoomLevel, zoomIn, zoomOut, reset } = useZoomScale();
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageInputValue, setPageInputValue] = useState<string>("1");
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
    const [showSearch, setShowSearch] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [debouncedQuery, setDebouncedQuery] = useState<string>("");
    const searchInputRef = useRef<HTMLInputElement>(null);

    const onDownloadClick = useCallback(() => {
        downloadFile(file.value?.uri);
    }, [file]);

    const toggleSearch = useCallback(() => {
        setShowSearch(prev => {
            if (prev) {
                setSearchQuery("");
                setDebouncedQuery("");
            }
            return !prev;
        });
    }, []);

    const handleSearchInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    }, []);

    const handleSearchKeyDown = useCallback(
        (event: KeyboardEvent<HTMLInputElement>) => {
            if (event.key === "Escape") {
                event.preventDefault();
                toggleSearch();
            }
        },
        [toggleSearch]
    );

    const handlePageInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        // Allow only numbers and empty string
        if (value === "" || /^\d+$/.test(value)) {
            setPageInputValue(value);
        }
    }, []);

    const validateAndSetPage = useCallback(() => {
        const pageNumber = parseInt(pageInputValue, 10);
        if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= numberOfPages) {
            setCurrentPage(pageNumber);
        } else {
            // Reset to current page if invalid input
            setPageInputValue(currentPage.toString());
        }
    }, [pageInputValue, numberOfPages, currentPage]);

    const handlePageInputSubmit = useCallback(
        (event: FormEvent) => {
            event.preventDefault();
            validateAndSetPage();
        },
        [validateAndSetPage]
    );

    const handlePageInputBlur = useCallback(() => {
        validateAndSetPage();
    }, [validateAndSetPage]);

    const handlePageInputKeyDown = useCallback(
        (event: KeyboardEvent<HTMLInputElement>) => {
            if (event.key === "Enter") {
                event.preventDefault();
                validateAndSetPage();
            }
            // Prevent non-numeric characters except backspace, delete, arrow keys, etc.
            if (
                !/[\d]/.test(event.key) &&
                !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Home", "End", "Tab"].includes(event.key) &&
                !event.ctrlKey &&
                !event.metaKey
            ) {
                event.preventDefault();
            }
        },
        [validateAndSetPage]
    );

    useEffect(() => {
        if (file.status === "available" && file.value.uri) {
            setPdfUrl(file.value.uri);
        }
    }, [file, file.status, file.value?.uri]);

    // Reset page to 1 when file changes (including content changes)
    useEffect(() => {
        if (file.value?.uri) {
            setCurrentPage(1);
            setPageInputValue("1");
            setPdfDoc(null);
            setSearchQuery("");
            setDebouncedQuery("");
        }
    }, [file.value]);

    // Debounce search query to avoid triggering search on every keystroke
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Auto-focus search input when search bar opens
    useEffect(() => {
        if (showSearch) {
            searchInputRef.current?.focus();
        }
    }, [showSearch]);

    // Sync page input value with current page
    useEffect(() => {
        setPageInputValue(currentPage.toString());
    }, [currentPage]);

    function onDocumentLoadSuccess(pdf: PDFDocumentProxy): void {
        setNumberOfPages(pdf.numPages);
        setPdfDoc(pdf);
    }

    const { matches, currentMatchIndex, goToNextMatch, goToPrevMatch, isSearching } = usePDFSearch(
        pdfDoc,
        debouncedQuery,
        setCurrentPage
    );

    const highlightRects = usePDFHighlightPositions(pdfDoc, currentPage, zoomLevel, matches, currentMatchIndex);

    const searchMatchLabel = debouncedQuery.trim()
        ? isSearching
            ? "Searching…"
            : matches.length === 0
              ? "No results"
              : `${currentMatchIndex + 1} of ${matches.length}`
        : "";

    if (!file.value?.uri) {
        return <div>No document selected</div>;
    }

    return (
        <BaseViewer
            {...props}
            fileName={file.value?.name || ""}
            SecondaryControl={
                showSearch ? (
                    <div className="widget-document-viewer-search-bar">
                        <input
                            ref={searchInputRef}
                            type="search"
                            value={searchQuery}
                            onChange={handleSearchInputChange}
                            onKeyDown={handleSearchKeyDown}
                            className="form-control widget-document-viewer-search-input"
                            aria-label="Search in document"
                            placeholder="Search…"
                        />
                        <span className="widget-document-viewer-search-count" aria-live="polite">
                            {searchMatchLabel}
                        </span>
                        <button
                            onClick={goToPrevMatch}
                            disabled={matches.length === 0}
                            className="icons icon-Left btn btn-icon-only"
                            aria-label="Previous match"
                            title="Previous match"
                        ></button>
                        <button
                            onClick={goToNextMatch}
                            disabled={matches.length === 0}
                            className="icons icon-Right btn btn-icon-only"
                            aria-label="Next match"
                            title="Next match"
                        ></button>
                    </div>
                ) : null
            }
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
                        <div className="widget-document-viewer-page-input">
                            <form onSubmit={handlePageInputSubmit}>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={pageInputValue}
                                    onChange={handlePageInputChange}
                                    onKeyDown={handlePageInputKeyDown}
                                    onBlur={handlePageInputBlur}
                                    className="form-control widget-document-viewer-page-number-input"
                                    aria-label="Page number"
                                    title={`Go to page (1-${numberOfPages})`}
                                    placeholder={currentPage.toString()}
                                />
                            </form>
                            <span className="widget-document-viewer-total-pages">/ {numberOfPages}</span>
                        </div>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, numberOfPages))}
                            disabled={currentPage >= numberOfPages}
                            className="icons icon-Right btn btn-icon-only"
                            aria-label={"Go to next page"}
                            title={"Go to next page"}
                        ></button>
                    </div>
                    <button
                        onClick={toggleSearch}
                        className="icons icon-Search btn btn-icon-only widget-document-viewer-search-toggle"
                        aria-label={showSearch ? "Close search" : "Search in document"}
                        aria-pressed={showSearch}
                        title={showSearch ? "Close search" : "Search in document"}
                    ></button>
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
            <If condition={!!pdfUrl && pdfjsWorkerUrl?.status === "available"}>
                <Document
                    file={pdfUrl}
                    options={options}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={() =>
                        setDocumentStatus({
                            status: DocumentStatus.error,
                            message: "Failed to load PDF document"
                        })
                    }
                >
                    <div className="widget-document-viewer-highlight-layer">
                        <Page pageNumber={currentPage} scale={zoomLevel} />
                        {highlightRects.map((rect, i) => (
                            <div
                                key={i}
                                className={`widget-document-viewer-highlight${rect.isCurrent ? " current" : ""}`}
                                style={{
                                    left: rect.x,
                                    top: rect.y,
                                    width: rect.width,
                                    height: rect.height
                                }}
                            />
                        ))}
                    </div>
                </Document>
            </If>
        </BaseViewer>
    );
};

PDFViewer.contentTypes = ["application/pdf", "application/x-pdf", "application/acrobat", "text/pdf", "text/html"];

PDFViewer.fileTypes = ["pdf"];

export default PDFViewer;
