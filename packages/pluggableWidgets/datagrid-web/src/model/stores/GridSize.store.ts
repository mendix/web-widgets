import { SetPageAction } from "@mendix/widget-plugin-grid/pagination/main";
import { ComputedAtom } from "@mendix/widget-plugin-mobx-kit/main";
import { action, computed, makeAutoObservable, observable } from "mobx";
import { createRef } from "react";
import { PaginationConfig } from "../../features/pagination/pagination.config";

export const VIRTUAL_SCROLLING_OFFSET = 30;

export class GridSizeStore {
    gridContainerRef = createRef<HTMLDivElement>();
    gridBodyRef = createRef<HTMLDivElement>();
    gridHeaderRef = createRef<HTMLDivElement>();

    scrollBarSize?: number;
    gridWidth?: number;
    gridBodyHeight?: number;
    columnSizes?: number[];

    private lockedAtPageSize?: number;

    constructor(
        private readonly hasMoreItemsAtom: ComputedAtom<boolean | undefined>,
        private readonly paginationConfig: PaginationConfig,
        private readonly setPageAction: SetPageAction,
        private readonly pageSizeAtom: ComputedAtom<number>
    ) {
        makeAutoObservable<GridSizeStore, "lockedAtPageSize">(this, {
            gridContainerRef: false,
            gridBodyRef: false,
            gridHeaderRef: false,
            lockedAtPageSize: false,

            scrollBarSize: observable,
            setScrollBarSize: action,

            gridWidth: observable,
            setGridWidth: action,

            gridBodyHeight: observable,
            lockGridBodyHeight: action,

            columnSizes: observable,
            updateColumnSizes: action,

            templateColumnsHead: computed
        });
    }

    get hasMoreItems(): boolean {
        return this.hasMoreItemsAtom.get() ?? false;
    }

    get hasVirtualScrolling(): boolean {
        return this.paginationConfig.pagination === "virtualScrolling";
    }

    get templateColumnsHead(): string | undefined {
        return this.columnSizes
            ?.map(size => {
                const str = size.toString();
                const dotIndex = str.indexOf(".");
                return `${dotIndex === -1 ? str : str.slice(0, dotIndex + 4)}px`;
            })
            .join(" ");
    }

    bumpPage(): void {
        if (this.hasMoreItems) {
            return this.setPageAction(page => page + 1);
        }
    }

    setScrollBarSize(size: number): void {
        this.scrollBarSize = size;
    }

    setGridWidth(size: number | undefined): void {
        this.gridWidth = size;
    }

    updateColumnSizes(sizes: number[]): void {
        this.columnSizes = sizes;
    }

    /**
     * Computes the total viewport height of visible rows based on the current page size.
     * @returns {number} Total height in pixels of visible rows, or 0 if no rows present.
     */
    computeBodyViewport(): number {
        const rows = Array.from(this.gridBodyRef.current?.children ?? []);
        if (rows.length === 0) {
            return 0;
        }

        const pageSize = this.pageSizeAtom.get();
        const visibleRows = rows.slice(0, pageSize);
        const totalHeight = visibleRows.reduce((sum, row) => {
            const rowHeight = row.children[0]?.clientHeight ?? 0;
            return sum + rowHeight;
        }, 0);
        return totalHeight;
    }

    lockGridBodyHeight(): void {
        if (!this.hasVirtualScrolling || !this.hasMoreItems) {
            return;
        }

        // Reset the locked height when page size changes so layout is recomputed
        // for the new number of rows (e.g. switching from 10 → 5 rows).
        const currentPageSize = this.pageSizeAtom.get();
        if (this.gridBodyHeight !== undefined && this.lockedAtPageSize !== currentPageSize) {
            this.gridBodyHeight = undefined;
            this.lockedAtPageSize = undefined;
        }

        const gridBody = this.gridBodyRef.current;
        if (!gridBody || this.gridBodyHeight !== undefined) {
            return;
        }

        const viewportHeight = this.computeBodyViewport();

        // Don't lock height before the grid body has rendered content.
        // clientHeight is 0 when the element has no layout yet, which would
        // produce a negative height and break scrolling.
        if (viewportHeight <= 0) {
            return;
        }

        // If content already overflows the container (fixed-height grid), do not subtract the
        // pre-fetch offset — that would hide the last rows and trigger the next page too early.
        // Only subtract the offset when the grid does not yet overflow (auto-height grid) so
        // that we create a small synthetic overflow that makes the body scrollable.
        const overflows = gridBody.scrollHeight > viewportHeight;
        this.gridBodyHeight = viewportHeight - (overflows ? 0 : VIRTUAL_SCROLLING_OFFSET);
        this.lockedAtPageSize = currentPageSize;
    }
}
