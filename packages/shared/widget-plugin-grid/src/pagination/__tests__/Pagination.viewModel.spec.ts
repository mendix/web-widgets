import { computed } from "mobx";
import { QueryService } from "../../interfaces/QueryService";
import { PaginationViewModel } from "../Pagination.viewModel";

function createQuery(overrides: Partial<QueryService> = {}): QueryService {
    return {
        limit: 10,
        offset: 0,
        hasMoreItems: true,
        totalCount: undefined,
        isFetchingNextBatch: false,
        isFirstLoad: false,
        isRefreshing: false,
        isSilentRefresh: false,
        items: [],
        setOffset: jest.fn(),
        setSortOrder: jest.fn(),
        setFilter: jest.fn(),
        setLimit: jest.fn(),
        requestTotalCount: jest.fn(),
        backgroundRefresh: jest.fn(),
        setBaseLimit: jest.fn(),
        reload: jest.fn(async () => undefined),
        fetchPage: jest.fn(async () => []),
        ...overrides
    } as unknown as QueryService;
}

describe("PaginationViewModel", () => {
    it("hides pagination for buttons.auto when total count is unknown", () => {
        const query = createQuery({ totalCount: undefined, limit: 10 });
        const vm = new PaginationViewModel(
            {
                pagination: "buttons",
                paginationKind: "buttons.auto",
                showPagingButtons: "auto"
            },
            query,
            computed(() => 0),
            computed(() => 10),
            jest.fn()
        );

        expect(vm.paginationVisible).toBe(false);
    });

    it("shows pagination for buttons.auto when total count exceeds limit", () => {
        const query = createQuery({ totalCount: 11, limit: 10 });
        const vm = new PaginationViewModel(
            {
                pagination: "buttons",
                paginationKind: "buttons.auto",
                showPagingButtons: "auto"
            },
            query,
            computed(() => 0),
            computed(() => 10),
            jest.fn()
        );

        expect(vm.paginationVisible).toBe(true);
    });

    it("hides built-in pagination for custom mode", () => {
        const query = createQuery({ totalCount: 50, limit: 10 });
        const vm = new PaginationViewModel(
            {
                pagination: "buttons",
                paginationKind: "custom",
                showPagingButtons: "always"
            },
            query,
            computed(() => 0),
            computed(() => 10),
            jest.fn()
        );

        expect(vm.paginationVisible).toBe(false);
    });
});
