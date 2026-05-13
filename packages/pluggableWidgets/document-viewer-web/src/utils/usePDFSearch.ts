import { useCallback, useEffect, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";

export interface SearchMatch {
    page: number;
    itemIndex: number;
    matchStart: number;
    matchEnd: number;
}

interface UsePDFSearchResult {
    matches: SearchMatch[];
    currentMatchIndex: number;
    goToNextMatch: () => void;
    goToPrevMatch: () => void;
    isSearching: boolean;
}

export function usePDFSearch(
    pdfDoc: PDFDocumentProxy | null,
    searchQuery: string,
    setCurrentPage: (page: number) => void
): UsePDFSearchResult {
    const [matches, setMatches] = useState<SearchMatch[]>([]);
    const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(-1);
    const [isSearching, setIsSearching] = useState<boolean>(false);

    useEffect(() => {
        const trimmedQuery = searchQuery.trim();
        if (!pdfDoc || !trimmedQuery) {
            setMatches([]);
            setCurrentMatchIndex(-1);
            setIsSearching(false);
            return;
        }

        let active = true;
        setIsSearching(true);

        const queryLower = trimmedQuery.toLowerCase();

        (async () => {
            const allMatches: SearchMatch[] = [];
            for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
                if (!active) {
                    break;
                }
                const page = await pdfDoc.getPage(pageNum);
                const textContent = await page.getTextContent();

                let strItemIndex = 0;
                textContent.items.forEach(item => {
                    if (!("str" in item)) {
                        return;
                    }
                    const itemIndex = strItemIndex++;
                    const str = (item as { str: string }).str.toLowerCase();
                    let start = 0;
                    let idx: number;
                    while ((idx = str.indexOf(queryLower, start)) !== -1) {
                        allMatches.push({
                            page: pageNum,
                            itemIndex,
                            matchStart: idx,
                            matchEnd: idx + queryLower.length
                        });
                        start = idx + queryLower.length;
                    }
                });
            }

            if (active) {
                setMatches(allMatches);
                setCurrentMatchIndex(allMatches.length > 0 ? 0 : -1);
                setIsSearching(false);
                if (allMatches.length > 0) {
                    setCurrentPage(allMatches[0].page);
                }
            }
        })();

        return () => {
            active = false;
        };
    }, [pdfDoc, searchQuery, setCurrentPage]);

    const goToNextMatch = useCallback(() => {
        if (matches.length === 0) {
            return;
        }
        const nextIndex = (currentMatchIndex + 1) % matches.length;
        setCurrentMatchIndex(nextIndex);
        setCurrentPage(matches[nextIndex].page);
    }, [matches, currentMatchIndex, setCurrentPage]);

    const goToPrevMatch = useCallback(() => {
        if (matches.length === 0) {
            return;
        }
        const prevIndex = (currentMatchIndex - 1 + matches.length) % matches.length;
        setCurrentMatchIndex(prevIndex);
        setCurrentPage(matches[prevIndex].page);
    }, [matches, currentMatchIndex, setCurrentPage]);

    return { matches, currentMatchIndex, goToNextMatch, goToPrevMatch, isSearching };
}
