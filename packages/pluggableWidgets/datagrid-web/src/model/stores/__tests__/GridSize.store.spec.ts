import { MutableRefObject } from "react";
import { computed, configure, observable } from "mobx";
import { SetPageAction } from "@mendix/widget-plugin-grid/pagination/main";
import { PaginationConfig } from "../../../features/pagination/pagination.config";
import { GridSizeStore, VIRTUAL_SCROLLING_OFFSET } from "../GridSize.store";

configure({ enforceActions: "never" });

function makePaginationConfig(pagination: "virtualScrolling" | "buttons" = "virtualScrolling"): PaginationConfig {
    return {
        pagination,
        pagingPosition: "bottom",
        paginationKind: "virtualScrolling.always",
        showPagingButtons: "always",
        showNumberOfRows: false,
        constPageSize: 10,
        initPageSize: 10,
        isLimitBased: false,
        dynamicPageSizeEnabled: false,
        dynamicPageEnabled: false,
        customPaginationEnabled: false,
        requestTotalCount: false
    };
}

interface StoreOptions {
    hasMoreItems?: boolean;
    pageSize?: number;
    columnCount?: number;
    pagination?: "virtualScrolling" | "buttons";
}

function buildStore(options: StoreOptions = {}): {
    store: GridSizeStore;
    hasMoreItemsBox: ReturnType<typeof observable.box<boolean | undefined>>;
    pageSizeBox: ReturnType<typeof observable.box<number>>;
    columnCountBox: ReturnType<typeof observable.box<number>>;
    setPageAction: jest.Mock;
} {
    const { hasMoreItems = true, pageSize = 10, columnCount = 3, pagination = "virtualScrolling" } = options;

    const hasMoreItemsBox = observable.box<boolean | undefined>(hasMoreItems);
    const pageSizeBox = observable.box(pageSize);
    const columnCountBox = observable.box(columnCount);
    const setPageAction = jest.fn() as unknown as SetPageAction;

    const store = new GridSizeStore(
        computed(() => hasMoreItemsBox.get()),
        makePaginationConfig(pagination),
        setPageAction,
        computed(() => pageSizeBox.get()),
        computed(() => columnCountBox.get())
    );

    return {
        store,
        hasMoreItemsBox,
        pageSizeBox,
        columnCountBox,
        setPageAction: setPageAction as unknown as jest.Mock
    };
}

function createMockRows(count: number, rowHeight: number): HTMLElement[] {
    return Array.from({ length: count }, () => {
        const row = document.createElement("div");
        const cell = document.createElement("div");
        Object.defineProperty(cell, "clientHeight", { value: rowHeight, configurable: true });
        row.appendChild(cell);
        return row;
    });
}

interface RefsOptions {
    rowHeight?: number;
    rowCount?: number;
    headerHeight?: number;
    containerClientHeight?: number;
    containerScrollHeight?: number;
    bodyScrollHeight?: number;
    bodyClientHeight?: number;
}

function setupRefs(store: GridSizeStore, options: RefsOptions = {}): void {
    const {
        rowHeight = 40,
        rowCount = 10,
        headerHeight = 50,
        containerClientHeight = 1000,
        containerScrollHeight,
        bodyScrollHeight,
        bodyClientHeight
    } = options;

    const container = document.createElement("div");
    Object.defineProperty(container, "clientHeight", { value: containerClientHeight, configurable: true });
    // Default scrollHeight to rowHeight * rowCount + headerHeight (= fullHeight at first lock,
    // before the container is constrained).
    Object.defineProperty(container, "scrollHeight", {
        value: containerScrollHeight ?? rowHeight * rowCount + headerHeight,
        configurable: true
    });
    (store.gridContainerRef as MutableRefObject<HTMLDivElement>).current = container;

    const body = document.createElement("div");
    createMockRows(rowCount, rowHeight).forEach(r => body.appendChild(r));
    Object.defineProperty(body, "scrollHeight", {
        value: bodyScrollHeight ?? rowHeight * rowCount,
        configurable: true
    });
    Object.defineProperty(body, "clientHeight", {
        value: bodyClientHeight ?? containerClientHeight - headerHeight,
        configurable: true
    });
    (store.gridBodyRef as MutableRefObject<HTMLDivElement>).current = body;

    const header = document.createElement("div");
    const th = document.createElement("div");
    th.className = "th";
    Object.defineProperty(th, "offsetHeight", { value: headerHeight, configurable: true });
    header.appendChild(th);
    (store.gridHeaderRef as MutableRefObject<HTMLDivElement>).current = header;
}

describe("GridSizeStore.lockGridContainerHeight()", () => {
    it("locks container height on first call when virtual scrolling is active and hasMoreItems", () => {
        const { store } = buildStore({ pageSize: 3, columnCount: 2 });
        // bodyViewport = 3 rows × 40px = 120px, header = 50px → fullHeight = 170px
        // containerClientHeight (1000) >= fullHeight (170) → no overflow → subtract VIRTUAL_SCROLLING_OFFSET
        setupRefs(store, { rowHeight: 40, rowCount: 3, headerHeight: 50, containerClientHeight: 1000 });

        store.lockGridContainerHeight();

        expect(store.gridContainerHeight).toBe(170 - VIRTUAL_SCROLLING_OFFSET);
    });

    it("is a no-op when hasVirtualScrolling is false", () => {
        const { store } = buildStore({ pagination: "buttons" });
        setupRefs(store);

        store.lockGridContainerHeight();

        expect(store.gridContainerHeight).toBeUndefined();
    });

    it("is a no-op when hasMoreItems is false", () => {
        const { store } = buildStore({ hasMoreItems: false });
        setupRefs(store);

        store.lockGridContainerHeight();

        expect(store.gridContainerHeight).toBeUndefined();
    });

    it("does not double-lock on repeated calls with same layout inputs", () => {
        const { store } = buildStore({ pageSize: 3, columnCount: 2 });
        setupRefs(store, { rowHeight: 40, rowCount: 3, headerHeight: 50, containerClientHeight: 1000 });

        store.lockGridContainerHeight();
        const heightAfterFirst = store.gridContainerHeight;

        // Mutate refs to simulate different measurements — if re-locking, height would change
        setupRefs(store, { rowHeight: 99, rowCount: 3, headerHeight: 50, containerClientHeight: 1000 });
        store.lockGridContainerHeight();

        expect(store.gridContainerHeight).toBe(heightAfterFirst);
    });

    it("clears and recomputes height when page size changes", () => {
        const { store, pageSizeBox } = buildStore({ pageSize: 3, columnCount: 2 });
        setupRefs(store, { rowHeight: 40, rowCount: 3, headerHeight: 50, containerClientHeight: 1000 });
        store.lockGridContainerHeight();
        const heightWithPageSize3 = store.gridContainerHeight;

        pageSizeBox.set(5);
        setupRefs(store, { rowHeight: 40, rowCount: 5, headerHeight: 50, containerClientHeight: 1000 });
        store.lockGridContainerHeight();

        // bodyViewport = 5 × 40 = 200, header = 50 → fullHeight = 250, no overflow → subtract offset
        expect(store.gridContainerHeight).toBe(250 - VIRTUAL_SCROLLING_OFFSET);
        expect(store.gridContainerHeight).not.toBe(heightWithPageSize3);
    });

    it("does not subtract offset when container scrollHeight exceeds full content height (fixed-height grid)", () => {
        const { store } = buildStore({ pageSize: 3, columnCount: 2 });
        // fullHeight = 3×40 + 50 = 170px; scrollHeight 200 > fullHeight → overflows → no offset
        setupRefs(store, { rowHeight: 40, rowCount: 3, headerHeight: 50, containerScrollHeight: 200 });

        store.lockGridContainerHeight();

        expect(store.gridContainerHeight).toBe(170); // no offset subtracted
    });

    it("clears and recomputes height when visible column count changes", () => {
        const { store, columnCountBox } = buildStore({ pageSize: 3, columnCount: 2 });
        setupRefs(store, { rowHeight: 40, rowCount: 3, headerHeight: 50, containerClientHeight: 1000 });
        store.lockGridContainerHeight();
        const heightWith2Columns = store.gridContainerHeight;

        columnCountBox.set(1);
        // Simulate rows getting shorter after hiding a column
        setupRefs(store, { rowHeight: 20, rowCount: 3, headerHeight: 50, containerClientHeight: 1000 });
        store.lockGridContainerHeight();

        // bodyViewport = 3 × 20 = 60, header = 50 → fullHeight = 110, no overflow → subtract offset
        expect(store.gridContainerHeight).toBe(110 - VIRTUAL_SCROLLING_OFFSET);
        expect(store.gridContainerHeight).not.toBe(heightWith2Columns);
    });
});
