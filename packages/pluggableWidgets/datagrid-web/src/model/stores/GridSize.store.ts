import { SetPageAction } from "@mendix/widget-plugin-grid/pagination/main";
import { ComputedAtom } from "@mendix/widget-plugin-mobx-kit/main";
import { action, makeAutoObservable, observable } from "mobx";
import { createRef } from "react";
import { PaginationConfig } from "../../features/pagination/pagination.config";

export const VIRTUAL_SCROLLING_OFFSET = 30;

export class GridSizeStore {
    gridContainerRef = createRef<HTMLDivElement>();
    gridBodyRef = createRef<HTMLDivElement>();
    gridHeaderRef = createRef<HTMLDivElement>();

    gridContainerHeight?: number;

    private lockedAtLayoutKey?: string;

    constructor(
        private readonly hasMoreItemsAtom: ComputedAtom<boolean | undefined>,
        private readonly paginationConfig: PaginationConfig,
        private readonly setPageAction: SetPageAction,
        private readonly pageSizeAtom: ComputedAtom<number>,
        private readonly visibleColumnsCountAtom: ComputedAtom<number>
    ) {
        makeAutoObservable<GridSizeStore, "lockedAtLayoutKey">(this, {
            gridContainerRef: false,
            gridBodyRef: false,
            gridHeaderRef: false,
            lockedAtLayoutKey: false,

            gridContainerHeight: observable,
            lockGridContainerHeight: action
        });
    }

    private get layoutKey(): string {
        return `${this.pageSizeAtom.get()}-${this.visibleColumnsCountAtom.get()}`;
    }

    get hasMoreItems(): boolean {
        return this.hasMoreItemsAtom.get() ?? false;
    }

    get hasVirtualScrolling(): boolean {
        return this.paginationConfig.pagination === "virtualScrolling";
    }

    bumpPage(): void {
        if (this.hasMoreItems) {
            return this.setPageAction(page => page + 1);
        }
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

    computeHeaderViewport(): number {
        const firstTh = this.gridHeaderRef.current?.querySelector<HTMLElement>(".th");

        if (!firstTh) {
            return 0;
        }

        return firstTh.offsetHeight;
    }

    lockGridContainerHeight(): void {
        if (!this.hasVirtualScrolling || !this.hasMoreItems) {
            return;
        }

        // Single cache key encodes all layout inputs. Any change (page size, column count,
        // or future inputs) invalidates the lock in one place.
        const currentKey = this.layoutKey;
        if (this.lockedAtLayoutKey !== currentKey) {
            this.lockedAtLayoutKey = undefined;
        }

        const gridContainer = this.gridContainerRef.current;
        if (!gridContainer || this.lockedAtLayoutKey !== undefined) {
            return;
        }

        const bodyViewportHeight = this.computeBodyViewport();
        const headerViewportHeight = this.computeHeaderViewport();

        // Don't lock before the grid body has rendered content — clientHeight is 0
        // before layout, which would produce a negative height and break scrolling.
        if (bodyViewportHeight <= 0) {
            return;
        }

        const fullHeight = bodyViewportHeight + headerViewportHeight;

        // clientHeight is vertical-only (excludes horizontal scrollbar overflow).
        // scrollHeight would be inflated by many-column grids and produce false positives.
        const overflows = gridContainer.clientHeight < fullHeight;
        this.gridContainerHeight = fullHeight - (overflows ? 0 : VIRTUAL_SCROLLING_OFFSET);
        this.lockedAtLayoutKey = currentKey;
    }
}
