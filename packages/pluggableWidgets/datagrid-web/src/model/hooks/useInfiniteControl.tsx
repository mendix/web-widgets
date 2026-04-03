import { RefObject, UIEvent, useCallback, useEffect } from "react";
import { useOnScreen } from "@mendix/widget-plugin-hooks/useOnScreen";
import { useGridSizeStore } from "@mendix/datagrid-web/src/model/hooks/injection-hooks";
import { VIRTUAL_SCROLLING_OFFSET } from "../stores/GridSize.store";

export function useInfiniteControl(): [trackBodyScrolling: ((e: any) => void) | undefined] {
    const gridSizeStore = useGridSizeStore();

    const isVisible = useOnScreen(gridSizeStore.gridContainerRef as RefObject<HTMLElement>);

    const trackTableScrolling = useCallback(
        (e: UIEvent<HTMLDivElement>) => {
            const target = e.target as HTMLElement;
            const container = gridSizeStore.gridContainerRef.current;
            if (container) {
                // this is cosmetic, needed to provide nice shadows when body is scrolled
                if (target.scrollTop > 0) {
                    container.dataset.scrolledY = "true";
                } else {
                    delete container.dataset.scrolledY;
                }
                if (target.scrollLeft > 0) {
                    container.dataset.scrolledX = "true";
                } else {
                    delete container.dataset.scrolledX;
                }
            }

            /**
             * In Windows OS the result of first expression returns a non integer and result in never loading more, require floor to solve.
             * note: Math floor sometimes result in incorrect integer value,
             * causing mismatch by 1 pixel point, thus, add magic number 2 as buffer.
             */
            const bottom =
                Math.floor(target.scrollHeight - VIRTUAL_SCROLLING_OFFSET - target.scrollTop) <=
                Math.floor(target.clientHeight) + 2;
            if (bottom) {
                gridSizeStore.bumpPage();
            }
        },
        [gridSizeStore]
    );

    useEffect(() => {
        const timer = setTimeout(() => isVisible && gridSizeStore.lockGridContainerHeight(), 100);
        return () => clearTimeout(timer);
    });

    return [gridSizeStore.hasVirtualScrolling ? trackTableScrolling : undefined];
}
