import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import type { SearchMatch } from "./usePDFSearch";

export interface HighlightRect {
    x: number;
    y: number;
    width: number;
    height: number;
    /** Index of this match in the full `matches` array; used to derive the current-match style. */
    globalMatchIndex: number;
}

/** Multiply two affine transforms stored as 6-element arrays [a, b, c, d, e, f]. */
function multiplyTransform(m1: number[], m2: number[]): number[] {
    return [
        m1[0] * m2[0] + m1[2] * m2[1],
        m1[1] * m2[0] + m1[3] * m2[1],
        m1[0] * m2[2] + m1[2] * m2[3],
        m1[1] * m2[2] + m1[3] * m2[3],
        m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
        m1[1] * m2[4] + m1[3] * m2[5] + m1[5]
    ];
}

/**
 * Computes absolutely-positioned highlight rectangles for all matches on the
 * current page by converting PDF text-item coordinates to screen coordinates
 * via the page viewport. Character offsets within an item are estimated using
 * canvas text measurement (same font size, generic family) scaled to the
 * actual rendered item width, which is more accurate than linear interpolation.
 *
 * Note: `currentMatchIndex` is intentionally NOT an input. Rect geometry does
 * not depend on which match is current — the consumer derives that at render
 * time from `globalMatchIndex`. Keeping it out avoids re-running the expensive
 * PDF page/text-content fetch on every prev/next click.
 */
export function usePDFHighlightPositions(
    pdfDoc: PDFDocumentProxy | null,
    currentPage: number,
    zoomLevel: number,
    matches: SearchMatch[]
): HighlightRect[] {
    const [rects, setRects] = useState<HighlightRect[]>([]);
    // Reuse a single canvas across effect runs for text measurement.
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        // Group current-page matches by their text-item index in a single pass,
        // preserving each match's global index (its position in `matches`).
        const matchesByItem = new Map<number, Array<{ match: SearchMatch; globalIndex: number }>>();
        matches.forEach((match, globalIndex) => {
            if (match.page !== currentPage) {
                return;
            }
            const bucket = matchesByItem.get(match.itemIndex);
            if (bucket) {
                bucket.push({ match, globalIndex });
            } else {
                matchesByItem.set(match.itemIndex, [{ match, globalIndex }]);
            }
        });

        if (!pdfDoc || matchesByItem.size === 0) {
            setRects([]);
            return;
        }

        let active = true;

        (async () => {
            try {
                const page = await pdfDoc.getPage(currentPage);
                const viewport = page.getViewport({ scale: zoomLevel });
                const textContent = await page.getTextContent();

                // Shared canvas for proportional character-width measurement.
                if (!canvasRef.current) {
                    canvasRef.current = document.createElement("canvas");
                }
                const ctx = canvasRef.current.getContext("2d");

                const newRects: HighlightRect[] = [];
                let strItemIndex = 0;

                textContent.items.forEach(rawItem => {
                    if (!("str" in rawItem)) {
                        return;
                    }

                    const itemIndex = strItemIndex++;
                    const item = rawItem as { str: string; transform: number[]; width: number };
                    const itemMatches = matchesByItem.get(itemIndex);
                    if (!itemMatches) {
                        return;
                    }

                    // Combined viewport+item transform → screen-space position.
                    const tx = multiplyTransform(viewport.transform, item.transform);
                    const screenX = tx[4]; // left edge of text baseline in CSS px
                    const screenY = tx[5]; // y of baseline (from page top) in CSS px

                    // Font height in screen pixels = magnitude of the y-column.
                    const fontHeight = Math.sqrt(tx[2] ** 2 + tx[3] ** 2);

                    // Item width in screen pixels (item.width is in PDF user space).
                    const itemScreenWidth = item.width * zoomLevel;

                    // Build a function that converts a [start,end) substring range
                    // into an {x, w} pair in screen pixels.
                    let segmentToRect: (start: number, end: number) => { x: number; w: number };

                    if (ctx && item.str.length > 0 && itemScreenWidth > 0) {
                        // Approximate glyph-proportional widths using canvas measurement
                        // at the same font size as the PDF item, then scale to actual width.
                        const fontSize = Math.max(1, Math.round(Math.sqrt(tx[0] ** 2 + tx[1] ** 2)));
                        ctx.font = `${fontSize}px sans-serif`;
                        const measuredTotal = ctx.measureText(item.str).width;
                        if (measuredTotal > 0) {
                            const scaleFactor = itemScreenWidth / measuredTotal;
                            segmentToRect = (start, end) => ({
                                x: screenX + ctx.measureText(item.str.slice(0, start)).width * scaleFactor,
                                w: ctx.measureText(item.str.slice(start, end)).width * scaleFactor
                            });
                        } else {
                            const perChar = itemScreenWidth / item.str.length;
                            segmentToRect = (start, end) => ({
                                x: screenX + start * perChar,
                                w: (end - start) * perChar
                            });
                        }
                    } else {
                        const perChar = item.str.length > 0 ? itemScreenWidth / item.str.length : 0;
                        segmentToRect = (start, end) => ({
                            x: screenX + start * perChar,
                            w: (end - start) * perChar
                        });
                    }

                    itemMatches.forEach(({ match, globalIndex }) => {
                        const { x, w } = segmentToRect(match.matchStart, match.matchEnd);
                        newRects.push({
                            x,
                            y: screenY - fontHeight,
                            width: w,
                            height: fontHeight,
                            globalMatchIndex: globalIndex
                        });
                    });
                });

                if (active) {
                    setRects(newRects);
                }
            } catch (error) {
                console.error("Failed to compute PDF highlight positions:", error);
                if (active) {
                    setRects([]);
                }
            }
        })();

        return () => {
            active = false;
        };
    }, [pdfDoc, currentPage, zoomLevel, matches]);

    return rects;
}
