import { action, computed, makeAutoObservable, observable } from "mobx";
import { createRef } from "react";
import { PaginationController } from "../services/PaginationController";

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
            setGridBodyHeight: action,

            columnSizes: observable,
            updateColumnSizes: action,

            templateColumnsHead: computed
        });
    }

    get hasMoreItems(): boolean {
        return this.paging.hasMoreItems;
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

    setGridBodyHeight(size: number): void {
        this.gridBodyHeight = size;
    }

    updateColumnSizes(sizes: number[]): void {
        this.columnSizes = sizes;
    }
}
