import { computed, observable, runInAction } from "mobx";
import { ComputedAtom } from "@mendix/widget-plugin-mobx-kit/main";
import { QueryService } from "../../interfaces/QueryService";
import { createSetPageAction, createSetPageSizeAction } from "../pagination.model";

function makeQueryMock(): jest.Mocked<Pick<QueryService, "setBaseLimit" | "setLimit" | "setOffset">> {
    return {
        setBaseLimit: jest.fn(),
        setLimit: jest.fn(),
        setOffset: jest.fn()
    };
}

function makePageSizeStore(initial: number): {
    pageSize: number;
    setPageSize: jest.MockedFunction<(n: number) => void>;
} {
    return {
        pageSize: initial,
        setPageSize: jest.fn()
    };
}

function boxAtom(initial: number): ComputedAtom<number> {
    const box = observable.box(initial);
    return computed(() => box.get()) as ComputedAtom<number>;
}

describe("createSetPageSizeAction", () => {
    describe("offset-based pagination", () => {
        it("calls setBaseLimit and repositions on the same page", () => {
            const query = makeQueryMock();
            const store = makePageSizeStore(10);
            const currentPage = boxAtom(2);
            const setPage = jest.fn();
            const action = createSetPageSizeAction(
                query as unknown as QueryService,
                { isLimitBased: false },
                currentPage,
                store,
                setPage
            );

            action(5);

            expect(query.setBaseLimit).toHaveBeenCalledWith(5);
            expect(store.setPageSize).toHaveBeenCalledWith(5);
            expect(setPage).toHaveBeenCalledWith(2);
        });
    });

    describe("limit-based pagination (virtual scroll / loadMore)", () => {
        it("calls setBaseLimit so sort/filter resets use the new page size", () => {
            // Regression: previously setBaseLimit was only called for !isLimitBased,
            // leaving baseLimit at constPageSize after a dynamic page size change.
            // A subsequent sort/filter reset would then show constPageSize items
            // instead of the dynamic page size.
            const query = makeQueryMock();
            const store = makePageSizeStore(10);
            const currentPage = boxAtom(1);
            const setPage = jest.fn();
            const action = createSetPageSizeAction(
                query as unknown as QueryService,
                { isLimitBased: true },
                currentPage,
                store,
                setPage
            );

            action(5);

            expect(query.setBaseLimit).toHaveBeenCalledWith(5);
            expect(store.setPageSize).toHaveBeenCalledWith(5);
            expect(setPage).toHaveBeenCalledWith(1);
        });

        it("repositions based on currentPage at the time of the call", () => {
            const query = makeQueryMock();
            const store = makePageSizeStore(10);
            const pageBox = observable.box(3);
            const currentPage = computed(() => pageBox.get()) as ComputedAtom<number>;
            const setPage = jest.fn();
            const action = createSetPageSizeAction(
                query as unknown as QueryService,
                { isLimitBased: true },
                currentPage,
                store,
                setPage
            );

            runInAction(() => action(5));

            expect(setPage).toHaveBeenCalledWith(3);
        });
    });
});

describe("createSetPageAction", () => {
    describe("offset-based", () => {
        it("sets offset to page * pageSize", () => {
            const query = makeQueryMock();
            const currentPage = boxAtom(0);
            const pageSize = boxAtom(10);
            const action = createSetPageAction(
                query as unknown as QueryService,
                { isLimitBased: false },
                currentPage,
                pageSize
            );

            action(3);

            expect(query.setOffset).toHaveBeenCalledWith(30);
        });

        it("accepts a function updater for relative page changes", () => {
            const query = makeQueryMock();
            const currentPage = boxAtom(2);
            const pageSize = boxAtom(10);
            const action = createSetPageAction(
                query as unknown as QueryService,
                { isLimitBased: false },
                currentPage,
                pageSize
            );

            action(p => p + 1);

            expect(query.setOffset).toHaveBeenCalledWith(30); // page 3 * size 10
        });
    });

    describe("limit-based (virtual scroll)", () => {
        it("sets limit to page * pageSize", () => {
            const query = makeQueryMock();
            const currentPage = boxAtom(1);
            const pageSize = boxAtom(5);
            const action = createSetPageAction(
                query as unknown as QueryService,
                { isLimitBased: true },
                currentPage,
                pageSize
            );

            action(3);

            expect(query.setLimit).toHaveBeenCalledWith(15);
        });
    });
});
