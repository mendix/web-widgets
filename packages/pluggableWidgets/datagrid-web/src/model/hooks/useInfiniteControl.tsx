import { RefObject, UIEvent, useCallback, useLayoutEffect } from "react";
import { useOnScreen } from "@mendix/widget-plugin-hooks/useOnScreen";
import { useGridSizeStore } from "@mendix/datagrid-web/src/model/hooks/injection-hooks";

const offsetBottom = 30;

export function useInfiniteControl(): [trackBodyScrolling: ((e: any) => void) | undefined] {
    const gridSizeStore = useGridSizeStore();

    const isVisible = useOnScreen(gridSizeStore.gridBodyRef as RefObject<HTMLElement>);

    const trackBodyScrolling = useCallback(
        (e: UIEvent<HTMLDivElement>) => {
            const target = e.target as HTMLElement;
            const head = gridSizeStore.gridHeaderRef.current;
            if (head) {
                // synchronize header position to the body as they are decoupled
                // we don't use state to optimize speed as we
                // don't want a re-render.
                head.scrollTo({ left: target.scrollLeft });

                // this is cosmetic, needed to provide nice shadows when body is scrolled
                head.dataset.scrolledY = target.scrollTop > 0 ? "true" : "false";
                head.dataset.scrolledX = target.scrollLeft > 0 ? "true" : "false";
            }

            // we need to determine scrollbar width to calculate header size correctly in css
            gridSizeStore.setScrollBarSize(target.offsetWidth - target.clientWidth);

            /**
             * In Windows OS the result of first expression returns a non integer and result in never loading more, require floor to solve.
             * note: Math floor sometimes result in incorrect integer value,
             * causing mismatch by 1 pixel point, thus, add magic number 2 as buffer.
             */
            const bottom =
                Math.floor(target.scrollHeight - offsetBottom - target.scrollTop) <=
                Math.floor(target.clientHeight) + 2;
            if (bottom) {
                gridSizeStore.bumpPage();
            }
        },
        [gridSizeStore]
    );

    const gridBody = gridSizeStore.gridBodyRef.current;
    const { isInfinite, gridBodyHeight, hasMoreItems } = gridSizeStore;

    const lockGridBodyHeight = useCallback((): void => {
        if (isVisible && isInfinite && hasMoreItems && gridBodyHeight === undefined && gridBody) {
            gridSizeStore.setGridBodyHeight(gridBody.clientHeight - offsetBottom);
        }
    }, [isVisible, isInfinite, hasMoreItems, gridBodyHeight, gridBody, gridSizeStore]);

    useLayoutEffect(() => {
        setTimeout(() => lockGridBodyHeight(), 100);
    }, [lockGridBodyHeight]);

    useLayoutEffect(() => {
        const observeTarget = gridSizeStore.gridContainerRef.current;
        if (!gridSizeStore.isInfinite || !observeTarget) return;

        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                gridSizeStore.setGridWidth(entry.target.clientWidth ? entry.target.clientWidth : undefined);
            }
        });

        resizeObserver.observe(observeTarget);

        return () => {
            resizeObserver.unobserve(observeTarget);
        };
    }, [gridSizeStore]);

    return [gridSizeStore.isInfinite ? trackBodyScrolling : undefined];
}
