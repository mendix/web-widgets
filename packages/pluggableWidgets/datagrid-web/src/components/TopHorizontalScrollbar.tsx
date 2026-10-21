import { observer } from "mobx-react-lite";
import { ReactElement, UIEvent, useEffect, useRef, useState } from "react";
import "../ui/TopHorizontalScrollbar.scss";
import { useGridSizeStore, useGridStyle } from "../model/hooks/injection-hooks";

export const TopHorizontalScrollbar = observer(function TopHorizontalScrollbar(): ReactElement {
    const gridSizeStore = useGridSizeStore();
    const hasVirtualScrolling = gridSizeStore.hasVirtualScrolling;
    const gridStyle = useGridStyle().get();

    const topScrollbarRef = useRef<HTMLDivElement>(null);
    const topScrollbarContentRef = useRef<HTMLDivElement>(null);
    const [hasOverflow, setHasOverflow] = useState(false);

    useEffect(() => {
        let content: HTMLDivElement | null = null;
        let grid: HTMLDivElement | null = null;
        let resizeObserver: ResizeObserver | null = null;

        let updateFrameId: number | null = null;
        let disposed = false;

        const topScrollbar = topScrollbarRef.current;
        const topScrollbarContent = topScrollbarContentRef.current;

        if (!topScrollbar || !topScrollbarContent) {
            return;
        }

        const updateTopScrollbar = (): void => {
            if (!content || !grid || disposed) {
                return;
            }

            if (updateFrameId !== null) {
                cancelAnimationFrame(updateFrameId);
            }

            updateFrameId = requestAnimationFrame(() => {
                if (!content || !grid || disposed) {
                    return;
                }

                // Match scroll ranges even when the two viewports have different widths.
                const overflowWidth = Math.max(0, content.scrollWidth - content.clientWidth);
                const requiredWidth = topScrollbar.clientWidth + overflowWidth;
                setHasOverflow(overflowWidth > 0);

                topScrollbarContent.style.width = `${requiredWidth}px`;
                topScrollbar.scrollLeft = content.scrollLeft;
                updateFrameId = null;
            });
        };

        const syncFromContent = (): void => {
            if (!content) {
                return;
            }
            topScrollbar.scrollLeft = content.scrollLeft;
        };

        const attachToGrid = (): void => {
            if (disposed) {
                return;
            }

            grid = gridSizeStore.gridContainerRef.current;

            if (!grid) {
                return;
            }

            // Virtual grids own both scroll axes; other grids scroll in the wrapper.
            content = hasVirtualScrolling ? grid : (grid.closest(".widget-datagrid-content") as HTMLDivElement | null);

            if (!content) {
                return;
            }

            content.addEventListener("scroll", syncFromContent, {
                passive: true
            });

            if (typeof ResizeObserver !== "undefined") {
                resizeObserver = new ResizeObserver(updateTopScrollbar);
                resizeObserver.observe(content);
                if (grid !== content) {
                    resizeObserver.observe(grid);
                }
            }
            window.addEventListener("resize", updateTopScrollbar);

            updateTopScrollbar();
        };

        attachToGrid();

        return () => {
            disposed = true;

            if (content) {
                content.removeEventListener("scroll", syncFromContent);
            }

            resizeObserver?.disconnect();
            window.removeEventListener("resize", updateTopScrollbar);

            if (updateFrameId !== null) {
                cancelAnimationFrame(updateFrameId);
            }
        };
    }, [gridSizeStore, gridStyle, hasVirtualScrolling]);

    const handleTopScrollbarScroll = (event: UIEvent<HTMLDivElement>): void => {
        const grid = gridSizeStore.gridContainerRef.current;

        if (!grid) {
            return;
        }

        const content = hasVirtualScrolling
            ? grid
            : (grid.closest(".widget-datagrid-content") as HTMLDivElement | null);

        if (!content) {
            return;
        }
        content.scrollLeft = event.currentTarget.scrollLeft;
    };

    return (
        <div
            className={`widget-datagrid-top-scrollbar${hasOverflow ? "" : " widget-datagrid-top-scrollbar--collapsed"}`}
            ref={topScrollbarRef}
            onScroll={handleTopScrollbarScroll}
            tabIndex={-1}
            aria-hidden="true"
            role="presentation"
        >
            <div className="widget-datagrid-top-scrollbar__content" ref={topScrollbarContentRef} />
        </div>
    );
});
