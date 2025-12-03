import { useInfiniteControl } from "@mendix/widget-plugin-grid/components/InfiniteBody";
import { RefObject, UIEventHandler, useCallback } from "react";
import { usePaginationVM } from "./injection-hooks";

export function useBodyScroll(): {
    handleScroll: UIEventHandler<HTMLDivElement> | undefined;
    bodySize: number;
    containerRef: RefObject<HTMLDivElement | null>;
    isInfinite: boolean;
} {
    const paging = usePaginationVM();
    const setPage = useCallback((cb: (n: number) => number) => paging.setPage(cb), [paging]);

    const isInfinite = paging.pagination === "virtualScrolling";
    const [trackScrolling, bodySize, containerRef] = useInfiniteControl({
        hasMoreItems: paging.hasMoreItems,
        isInfinite,
        setPage
    });

    return {
        handleScroll: isInfinite ? trackScrolling : undefined,
        bodySize,
        containerRef,
        isInfinite
    };
}
