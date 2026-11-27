import { useEffect, useState } from "react";

/**
 * Tracks the content width of an element, rounded down to whole pixels.
 * Returns `undefined` until a non-zero width is measured (e.g. while hidden in a tab).
 */
export function useElementWidth<T extends HTMLElement>(): [(element: T | null) => void, number | undefined] {
    const [element, setElement] = useState<T | null>(null);
    const [width, setWidth] = useState<number | undefined>(undefined);

    useEffect(() => {
        if (!element || typeof ResizeObserver === "undefined") {
            return;
        }
        const observer = new ResizeObserver(entries => {
            const measured = Math.floor(entries[0]?.contentRect.width ?? 0);
            if (measured > 0) {
                setWidth(measured);
            }
        });
        observer.observe(element);
        return () => observer.disconnect();
    }, [element]);

    return [setElement, width];
}
