import { renderHook, waitFor } from "@testing-library/react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { usePDFHighlightPositions } from "../usePDFHighlightPositions";
import type { SearchMatch } from "../usePDFSearch";

const pageWidth = 600;
const pageHeight = 800;

// A single text item "abcdefghij" of 100pt width with a 10pt font, baseline at (50, 700) in PDF space.
const pdfDoc = {
    getPage: async () => ({
        getViewport: ({ scale }: { scale: number }) => ({
            width: pageWidth * scale,
            height: pageHeight * scale,
            transform: [scale, 0, 0, -scale, 0, pageHeight * scale]
        }),
        getTextContent: async () => ({
            items: [{ str: "abcdefghij", transform: [10, 0, 0, 10, 50, 700], width: 100 }]
        })
    })
} as unknown as PDFDocumentProxy;

const matches: SearchMatch[] = [{ page: 1, itemIndex: 0, matchStart: 2, matchEnd: 4 }];

describe("usePDFHighlightPositions", () => {
    beforeEach(() => {
        jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("positions highlights at the zoom level when the page has its natural size", async () => {
        const { result } = renderHook(() => usePDFHighlightPositions(pdfDoc, 1, 2, matches));

        await waitFor(() => expect(result.current).toHaveLength(1));
        expect(result.current[0]).toEqual({ x: 140, y: 180, width: 40, height: 20, globalMatchIndex: 0 });
    });

    it("positions highlights on a page fitted to the container width", async () => {
        // 900px container / 600pt page = 1.5, times zoom 2 = 3.
        const { result } = renderHook(() => usePDFHighlightPositions(pdfDoc, 1, 2, matches, 900));

        await waitFor(() => expect(result.current).toHaveLength(1));
        expect(result.current[0]).toEqual({ x: 210, y: 270, width: 60, height: 30, globalMatchIndex: 0 });
    });
});
