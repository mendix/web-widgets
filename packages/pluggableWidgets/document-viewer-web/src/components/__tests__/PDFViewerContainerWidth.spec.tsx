import { act, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Page } from "react-pdf";
import type { DocumentRendererProps } from "../documentRenderer";
import PDFViewer from "../PDFViewer";

jest.mock("react-pdf", () => ({
    Document: jest.fn((props: { children?: unknown }) => props.children ?? null),
    Page: jest.fn(() => null),
    pdfjs: {
        GlobalWorkerOptions: {} as { workerSrc: string },
        version: "4.8.69"
    }
}));

const props = {
    file: { status: "available", value: { uri: "https://example.com/file.pdf", name: "file.pdf" } },
    pdfjsWorkerUrl: { status: "available", value: "https://example.com/worker.js" },
    setDocumentStatus: jest.fn(),
    documentStatus: { status: "available" }
} as unknown as DocumentRendererProps;

const OriginalResizeObserver = window.ResizeObserver;
let reportWidth: (width: number) => void;

beforeEach(() => {
    window.ResizeObserver = class {
        constructor(private readonly callback: ResizeObserverCallback) {}
        observe(target: Element): void {
            reportWidth = width =>
                act(() =>
                    this.callback(
                        [{ target, contentRect: { width, height: 600 } } as unknown as ResizeObserverEntry],
                        this as unknown as ResizeObserver
                    )
                );
        }
        unobserve(): void {}
        disconnect(): void {}
    } as unknown as typeof ResizeObserver;
});

afterEach(() => {
    window.ResizeObserver = OriginalResizeObserver;
});

function lastPageProps(): { width?: number; scale?: number } {
    const calls = (Page as unknown as jest.Mock).mock.calls;
    return calls[calls.length - 1][0];
}

describe("PDFViewer container width", () => {
    it("keeps the natural page size while the container has no width, then fits once it does", () => {
        render(<PDFViewer {...props} />);

        reportWidth(0);
        expect(lastPageProps().width).toBeUndefined();

        reportWidth(800);
        expect(lastPageProps().width).toBe(800);
    });

    it("follows the container when it is resized", () => {
        render(<PDFViewer {...props} />);

        reportWidth(900);
        reportWidth(500);

        expect(lastPageProps()).toMatchObject({ width: 500, scale: 1 });
    });

    it("keeps Fit to width enabled at maximum zoom", () => {
        render(<PDFViewer {...props} />);
        reportWidth(900);

        for (let i = 0; i < 20; i++) {
            fireEvent.click(screen.getByLabelText("Zoom in"));
        }
        expect(screen.getByLabelText("Zoom in")).toBeDisabled();
        expect(screen.getByLabelText("Fit to width")).toBeEnabled();

        fireEvent.click(screen.getByLabelText("Fit to width"));
        expect(lastPageProps()).toMatchObject({ width: 900, scale: 1 });
    });
});
