import { dynamicPageEnabled, dynamicPageSizeEnabled, requestTotalCount } from "../pagination.config";

function makeProps(overrides = {}) {
    // minimal set required by config functions
    return {
        pagination: "buttons",
        showNumberOfRows: false,
        pageSize: 10,
        pagingPosition: "bottom",
        useCustomPagination: false,
        showPagingButtons: "always",
        refreshIndicator: false,
        refreshInterval: 0,
        datasource: {},
        columns: [],
        filtersPlaceholder: {},
        ...overrides
    };
}

describe("pagination.config helpers", () => {
    describe("requestTotalCount", () => {
        it("returns true when totalCountValue is provided no matter the pagination", () => {
            const props = makeProps({ totalCountValue: {}, pagination: "virtualScrolling" });
            expect(requestTotalCount(props)).toBe(true);
        });

        it("returns true for buttons pagination even without attribute", () => {
            const props = makeProps({ pagination: "buttons" });
            expect(requestTotalCount(props)).toBe(true);
        });

        it("returns true when showNumberOfRows is true", () => {
            const props = makeProps({ pagination: "virtualScrolling", showNumberOfRows: true });
            expect(requestTotalCount(props)).toBe(true);
        });

        it("returns false when no hints present and non-buttons pagination", () => {
            const props = makeProps({ pagination: "virtualScrolling", showNumberOfRows: false });
            expect(requestTotalCount(props)).toBe(false);
        });
    });

    describe("dynamicPageEnabled", () => {
        it("is true when dynamicPage attribute exists", () => {
            const props = makeProps({ dynamicPage: {}, pagination: "buttons" });
            expect(dynamicPageEnabled(props)).toBe(true);
        });

        it("stays true for limit-based pagination", () => {
            const props = makeProps({ dynamicPage: {}, pagination: "virtualScrolling" });
            expect(dynamicPageEnabled(props)).toBe(true);
        });

        it("is false when no attribute provided", () => {
            const props = makeProps({ pagination: "virtualScrolling" });
            expect(dynamicPageEnabled(props)).toBe(false);
        });
    });

    describe("dynamicPageSizeEnabled", () => {
        it("is true when dynamicPageSize attribute exists", () => {
            const props = makeProps({ dynamicPageSize: {}, pagination: "buttons" });
            expect(dynamicPageSizeEnabled(props)).toBe(true);
        });

        it("stays true for limit-based pagination", () => {
            const props = makeProps({ dynamicPageSize: {}, pagination: "loadMore" });
            expect(dynamicPageSizeEnabled(props)).toBe(true);
        });

        it("is false when no attribute provided", () => {
            const props = makeProps({ pagination: "loadMore" });
            expect(dynamicPageSizeEnabled(props)).toBe(false);
        });
    });
});
