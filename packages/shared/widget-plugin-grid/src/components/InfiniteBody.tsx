import { PropsWithChildren, RefObject, useCallback, useLayoutEffect, useRef, useState } from "react";
import { useOnScreen } from "@mendix/widget-plugin-hooks/useOnScreen";

export interface InfiniteBodyProps {
    hasMoreItems: boolean;
    isInfinite: boolean;
    setPage?: (computePage: (prevPage: number) => number) => void;
}
const offsetBottom = 30;

export function useInfiniteControl(
    props: PropsWithChildren<InfiniteBodyProps>
): [
    trackBodyScrolling: ((e: any) => void) | undefined,
    bodyHeight: string | undefined,
    gridWidth: string | undefined,
    scrollBarSize: string | undefined,
    gridBodyRef: RefObject<HTMLDivElement | null>,
    gridContainerRef: RefObject<HTMLDivElement | null>,
    gridHeaderRef: RefObject<HTMLDivElement | null>
] {
    const { setPage, hasMoreItems, isInfinite } = props;
    const [gridWidth, setGridWidth] = useState<string | undefined>();
    const [bodyHeight, setBodyHeight] = useState<string | undefined>();
    const [scrollBarSize, setScrollBarSize] = useState<string | undefined>();
    const gridContainerRef = useRef<HTMLDivElement | null>(null);
    const gridBodyRef = useRef<HTMLDivElement>(null);
    const gridHeaderRef = useRef<HTMLDivElement | null>(null);
    const isVisible = useOnScreen(gridBodyRef as RefObject<HTMLElement>);

    const trackBodyScrolling = useCallback(
        (e: any) => {
            const head = gridHeaderRef.current;
            if (head) {
                // synchronize header position to the body as they are decoupled
                // we don't use state to optimize speed as we
                // don't want a re-render.
                head.scrollTo({ left: e.target.scrollLeft });

                // this is cosmetic, needed to provide nice shadows when body is scrolled
                head.dataset.scrolledY = e.target.scrollTop > 0 ? "true" : "false";
                head.dataset.scrolledX = e.target.scrollLeft > 0 ? "true" : "false";
            }

            // we need to determine scrollbar width to calculate header size correctly in css
            const scrollBarSize = e.target.offsetWidth - e.target.clientWidth;
            setScrollBarSize(`${scrollBarSize}px`);

            /**
             * In Windows OS the result of first expression returns a non integer and result in never loading more, require floor to solve.
             * note: Math floor sometimes result in incorrect integer value,
             * causing mismatch by 1 pixel point, thus, add magic number 2 as buffer.
             */
            const bottom =
                Math.floor(e.target.scrollHeight - offsetBottom - e.target.scrollTop) <=
                Math.floor(e.target.clientHeight) + 2;
            if (bottom) {
                if (hasMoreItems && setPage) {
                    setPage(prev => prev + 1);
                }
            }
        },
        [hasMoreItems, setPage]
    );

    const lockGridBodyHeight = useCallback((): void => {
        if (isVisible && isInfinite && hasMoreItems && bodyHeight === undefined && gridBodyRef.current) {
            setBodyHeight(`${gridBodyRef.current.clientHeight - offsetBottom}px`);
        }
    }, [isInfinite, hasMoreItems, bodyHeight, isVisible]);

    useLayoutEffect(() => {
        setTimeout(() => lockGridBodyHeight(), 100);
    }, [lockGridBodyHeight]);

    useLayoutEffect(() => {
        const observeTarget = gridContainerRef.current;
        if (!isInfinite || !observeTarget) return;

        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                setGridWidth(entry.target.clientWidth ? `${entry.target.clientWidth}px` : undefined);
            }
        });

        resizeObserver.observe(observeTarget);

        return () => {
            resizeObserver.unobserve(observeTarget);
        };
    }, [isInfinite]);

    return [
        isInfinite ? trackBodyScrolling : undefined,
        bodyHeight,
        gridWidth,
        scrollBarSize,
        gridBodyRef,
        gridContainerRef,
        gridHeaderRef
    ];
}
