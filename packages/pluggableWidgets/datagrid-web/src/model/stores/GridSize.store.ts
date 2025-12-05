import { action, computed, makeAutoObservable, observable } from "mobx";
import { createRef } from "react";
import { PaginationController } from "../services/PaginationController";

export const VIRTUAL_SCROLLING_OFFSET = 30;

export class GridSizeStore {
    gridContainerRef = createRef<HTMLDivElement>();
    gridBodyRef = createRef<HTMLDivElement>();
    gridHeaderRef = createRef<HTMLDivElement>();

    scrollBarSize?: number;
    gridWidth?: number;
    gridBodyHeight?: number;
    columnSizes?: number[];

    paging: PaginationController;

    constructor(paging: PaginationController) {
        this.paging = paging;

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

    get hasVirtualScrolling(): boolean {
        return this.paging.pagination === "virtualScrolling";
    }

    get templateColumnsHead(): string | undefined {
        return this.columnSizes?.map(s => `${s}px`).join(" ");
    }

    bumpPage(): void {
        if (this.paging.hasMoreItems) {
            return this.paging.setPage(page => page + 1);
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
        if (!this.hasVirtualScrolling || !this.paging.hasMoreItems) {
            return;
        }
        const gridBody = this.gridBodyRef.current;
        if (!gridBody || this.gridBodyHeight !== undefined) {
            return;
        }

        this.gridBodyHeight = gridBody.clientHeight - VIRTUAL_SCROLLING_OFFSET;
    }
}
