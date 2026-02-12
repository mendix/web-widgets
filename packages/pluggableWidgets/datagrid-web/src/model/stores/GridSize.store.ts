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

    constructor(
        private readonly hasMoreItemsAtom: ComputedAtom<boolean | undefined>,
        private readonly paginationConfig: PaginationConfig,
        private readonly setPageAction: SetPageAction
    ) {
        makeAutoObservable(this, {
            gridContainerRef: false,
            gridBodyRef: false,
            gridHeaderRef: false,

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

    lockGridBodyHeight(): void {
        if (!this.hasVirtualScrolling || !this.hasMoreItems) {
            return;
        }
        const gridBody = this.gridBodyRef.current;
        if (!gridBody || this.gridBodyHeight !== undefined) {
            return;
        }

        this.gridBodyHeight = gridBody.clientHeight - VIRTUAL_SCROLLING_OFFSET;
    }
}
