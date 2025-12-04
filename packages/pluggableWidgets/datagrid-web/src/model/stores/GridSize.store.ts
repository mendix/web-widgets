import { action, computed, makeAutoObservable, observable } from "mobx";
import { createRef } from "react";
import { ComputedAtom } from "@mendix/widget-plugin-mobx-kit/src/interfaces/ComputedAtom";
import { SetPageAction } from "@mendix/widget-plugin-grid/src/pagination/pagination.model.ts";
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

    hasMoreItemsAtom: ComputedAtom<boolean | undefined>;
    paginationConfig: PaginationConfig;
    setPageAction: SetPageAction;

    constructor(
        hasMoreItemsAtom: ComputedAtom<boolean | undefined>,
        paginationConfig: PaginationConfig,
        setPageAction: SetPageAction
    ) {
        this.hasMoreItemsAtom = hasMoreItemsAtom;
        this.paginationConfig = paginationConfig;
        this.setPageAction = setPageAction;

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
        return this.columnSizes?.map(s => `${s}px`).join(" ");
    }

    bumpPage(): void {
        if (this.hasMoreItemsAtom.get()) {
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
