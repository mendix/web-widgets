import { act, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Document, pdfjs } from "react-pdf";
import PDFViewer from "../PDFViewer";
import type { DocumentRendererProps } from "../documentRenderer";

jest.mock("react-pdf", () => ({
    Document: jest.fn((props: { children?: unknown }) => props.children ?? null),
    Page: jest.fn(() => null),
    pdfjs: {
        GlobalWorkerOptions: {} as { workerSrc: string },
        version: "4.8.69"
    }
}));

function buildProps(overrides: Partial<DocumentRendererProps> = {}): DocumentRendererProps {
    return {
        file: {
            status: "available",
            value: { uri: "https://apps.example.com/file/123.pdf", name: "file.pdf" }
        },
        pdfjsWorkerUrl: { status: "available", value: "https://apps.example.com/worker.js" },
        setDocumentStatus: jest.fn(),
        documentStatus: { status: "available" as never },
        ...overrides
    } as unknown as DocumentRendererProps;
}

function lastDocumentProps(): {
    options: { cMapUrl: string; standardFontDataUrl: string };
    onLoadSuccess: (args: { numPages: number }) => void;
    onLoadError: () => void;
} {
    const calls = (Document as unknown as jest.Mock).mock.calls;
    return calls[calls.length - 1][0];
}

describe("PDFViewer resource URL resolution", () => {
    const originalMx = window.mx;

    afterEach(() => {
        window.mx = originalMx;
    });

    /**
     * Re-evaluates the PDFViewer module against the current `window` state and
     * returns the resource `options` passed down to react-pdf's `Document`.
     * The `origin` constant is computed at module load, so the module must be
     * re-imported between cases for the different `window.mx` states to take effect.
     */
    function loadOptions(): { cMapUrl: string; standardFontDataUrl: string } {
        jest.resetModules();
        // Re-require React, RTL, react-pdf and PDFViewer together so they all share
        // the same freshly-evaluated React instance (resetModules resets React too).
        /* eslint-disable @typescript-eslint/no-require-imports */
        const { createElement } = require("react");
        const { render: renderFresh } = require("@testing-library/react");
        const reactPdf = require("react-pdf");
        const FreshPDFViewer = require("../PDFViewer").default;
        /* eslint-enable @typescript-eslint/no-require-imports */

        renderFresh(createElement(FreshPDFViewer, buildProps()));

        const calls = (reactPdf.Document as jest.Mock).mock.calls;
        return calls[calls.length - 1][0].options;
    }

    it("uses mx.appUrl to build absolute cMap and standard font URLs", () => {
        window.mx = { appUrl: "https://apps.example.com/my-app" };

        expect(loadOptions()).toEqual({
            cMapUrl: "https://apps.example.com/my-app/widgets/com/mendix/shared/pdfjs/cmaps/",
            standardFontDataUrl: "https://apps.example.com/my-app/widgets/com/mendix/shared/pdfjs/standard_fonts/"
        });
    });

    it("strips a trailing slash from mx.appUrl to avoid double slashes", () => {
        window.mx = { appUrl: "https://apps.example.com/my-app/" };

        expect(loadOptions()).toEqual({
            cMapUrl: "https://apps.example.com/my-app/widgets/com/mendix/shared/pdfjs/cmaps/",
            standardFontDataUrl: "https://apps.example.com/my-app/widgets/com/mendix/shared/pdfjs/standard_fonts/"
        });
    });

    it("falls back to window.location.origin when mx is absent", () => {
        window.mx = undefined;

        expect(loadOptions()).toEqual({
            cMapUrl: `${window.location.origin}/widgets/com/mendix/shared/pdfjs/cmaps/`,
            standardFontDataUrl: `${window.location.origin}/widgets/com/mendix/shared/pdfjs/standard_fonts/`
        });
    });

    it("falls back to window.location.origin when mx.appUrl is undefined", () => {
        window.mx = {};

        expect(loadOptions()).toEqual({
            cMapUrl: `${window.location.origin}/widgets/com/mendix/shared/pdfjs/cmaps/`,
            standardFontDataUrl: `${window.location.origin}/widgets/com/mendix/shared/pdfjs/standard_fonts/`
        });
    });
});

describe("PDFViewer worker resolution", () => {
    it("uses the provided worker url when available", () => {
        render(<PDFViewer {...buildProps()} />);

        expect(pdfjs.GlobalWorkerOptions.workerSrc).toBe("https://apps.example.com/worker.js");
    });

    it("falls back to the unpkg cdn worker when no url is provided", () => {
        render(<PDFViewer {...buildProps({ pdfjsWorkerUrl: { status: "available", value: "" } as never })} />);

        expect(pdfjs.GlobalWorkerOptions.workerSrc).toBe(
            `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
        );
    });

    it("reports an error and uses no worker when the worker is unavailable", () => {
        const setDocumentStatus = jest.fn();

        render(
            <PDFViewer {...buildProps({ pdfjsWorkerUrl: { status: "unavailable" } as never, setDocumentStatus })} />
        );

        expect(setDocumentStatus).toHaveBeenCalledWith({
            status: "error",
            message: "Failed to load PDF document : pdfjsWorker unavailable"
        });
        expect(pdfjs.GlobalWorkerOptions.workerSrc).toBe("");
    });

    it("uses no worker when the worker status is loading", () => {
        render(<PDFViewer {...buildProps({ pdfjsWorkerUrl: { status: "loading" } as never })} />);

        expect(pdfjs.GlobalWorkerOptions.workerSrc).toBe("");
    });
});

describe("PDFViewer rendering", () => {
    it("shows a placeholder when no document is selected", () => {
        render(<PDFViewer {...buildProps({ file: { status: "loading", value: undefined } as never })} />);

        expect(screen.getByText("No document selected")).toBeInTheDocument();
    });

    it("renders the file name and pagination controls", () => {
        render(<PDFViewer {...buildProps()} />);

        expect(screen.getByText("file.pdf")).toBeInTheDocument();
        expect(screen.getByLabelText("Page number")).toBeInTheDocument();
        expect(screen.getByLabelText("Go to next page")).toBeInTheDocument();
    });

    it("updates the total page count when the document loads", () => {
        render(<PDFViewer {...buildProps()} />);

        act(() => lastDocumentProps().onLoadSuccess({ numPages: 7 }));

        expect(screen.getByText("/ 7")).toBeInTheDocument();
    });

    it("reports an error when the document fails to load", () => {
        const setDocumentStatus = jest.fn();
        render(<PDFViewer {...buildProps({ setDocumentStatus })} />);

        act(() => lastDocumentProps().onLoadError());

        expect(setDocumentStatus).toHaveBeenCalledWith({
            status: "error",
            message: "Failed to load PDF document"
        });
    });
});

describe("PDFViewer pagination", () => {
    function renderWithPages(numPages: number): void {
        render(<PDFViewer {...buildProps()} />);
        act(() => lastDocumentProps().onLoadSuccess({ numPages }));
    }

    it("disables the previous button on the first page and enables next", () => {
        renderWithPages(3);

        expect(screen.getByLabelText("Go to previous page")).toBeDisabled();
        expect(screen.getByLabelText("Go to next page")).toBeEnabled();
    });

    it("navigates to the next and previous page", () => {
        renderWithPages(3);

        fireEvent.click(screen.getByLabelText("Go to next page"));
        expect(screen.getByLabelText<HTMLInputElement>("Page number").value).toBe("2");

        fireEvent.click(screen.getByLabelText("Go to previous page"));
        expect(screen.getByLabelText<HTMLInputElement>("Page number").value).toBe("1");
    });

    it("disables the next button on the last page", () => {
        renderWithPages(2);

        fireEvent.click(screen.getByLabelText("Go to next page"));

        expect(screen.getByLabelText("Go to next page")).toBeDisabled();
    });

    it("accepts only numeric input in the page field", () => {
        renderWithPages(5);
        const input = screen.getByLabelText<HTMLInputElement>("Page number");

        fireEvent.change(input, { target: { value: "3" } });
        expect(input.value).toBe("3");

        fireEvent.change(input, { target: { value: "abc" } });
        expect(input.value).toBe("3");
    });

    it("jumps to a valid page on submit", () => {
        renderWithPages(5);
        const input = screen.getByLabelText<HTMLInputElement>("Page number");

        fireEvent.change(input, { target: { value: "4" } });
        fireEvent.submit(input.closest("form")!);

        expect(input.value).toBe("4");
    });

    it("resets to the current page when an out-of-range page is submitted", () => {
        renderWithPages(5);
        const input = screen.getByLabelText<HTMLInputElement>("Page number");

        fireEvent.change(input, { target: { value: "99" } });
        fireEvent.blur(input);

        expect(input.value).toBe("1");
    });

    it("validates the page on Enter key press", () => {
        renderWithPages(5);
        const input = screen.getByLabelText<HTMLInputElement>("Page number");

        fireEvent.change(input, { target: { value: "2" } });
        fireEvent.keyDown(input, { key: "Enter" });

        expect(input.value).toBe("2");
    });

    it("prevents non-numeric key presses", () => {
        renderWithPages(5);
        const input = screen.getByLabelText<HTMLInputElement>("Page number");

        const notPrevented = fireEvent.keyDown(input, { key: "a" });

        expect(notPrevented).toBe(false);
    });

    it("allows control keys such as Backspace", () => {
        renderWithPages(5);
        const input = screen.getByLabelText<HTMLInputElement>("Page number");

        const notPrevented = fireEvent.keyDown(input, { key: "Backspace" });

        expect(notPrevented).toBe(true);
    });
});

describe("PDFViewer toolbar actions", () => {
    it("downloads the file in a new window", () => {
        const openSpy = jest.spyOn(window, "open").mockImplementation(() => null);
        render(<PDFViewer {...buildProps()} />);

        fireEvent.click(screen.getByLabelText("Download"));

        expect(openSpy).toHaveBeenCalledTimes(1);
        const [url, windowName] = openSpy.mock.calls[0];
        expect(windowName).toBe("mendix_file");
        expect(url!.toString()).toBe("https://apps.example.com/file/123.pdf?target=window");
        openSpy.mockRestore();
    });

    it("disables zoom out at the minimum and zoom in at the maximum", () => {
        render(<PDFViewer {...buildProps()} />);

        const zoomOut = screen.getByLabelText("Zoom out");
        const zoomIn = screen.getByLabelText("Zoom in");

        // Many zoom-outs hit the lower bound and disable the button.
        for (let i = 0; i < 10; i++) {
            fireEvent.click(zoomOut);
        }
        expect(zoomOut).toBeDisabled();

        fireEvent.click(screen.getByLabelText("Fit to width"));

        // Many zoom-ins hit the upper bound and disable the button.
        for (let i = 0; i < 20; i++) {
            fireEvent.click(zoomIn);
        }
        expect(zoomIn).toBeDisabled();
    });
});
