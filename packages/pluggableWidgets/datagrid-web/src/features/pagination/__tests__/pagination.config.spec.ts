import { MainGateProps } from "typings/MainGateProps";
import { dynamicPageEnabled, dynamicPageSizeEnabled, requestTotalCount } from "../pagination.config";

function makeProps(overrides = {}): Partial<MainGateProps> {
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
        datasource: undefined,
        columns: [],
        filtersPlaceholder: undefined,
        ...overrides
    };
}

describe("pagination.config helpers", () => {
    describe("requestTotalCount", () => {
        it("returns true when totalCountValue is provided no matter the pagination", () => {
            const props = makeProps({ totalCountValue: {}, pagination: "virtualScrolling" });
            expect(requestTotalCount(props as MainGateProps)).toBe(true);
        });

        it("returns true for buttons pagination even without attribute", () => {
            const props = makeProps({ pagination: "buttons" });
            expect(requestTotalCount(props as MainGateProps)).toBe(true);
        });

        it("returns true when showNumberOfRows is true", () => {
            const props = makeProps({ pagination: "virtualScrolling", showNumberOfRows: true });
            expect(requestTotalCount(props as MainGateProps)).toBe(true);
        });

        it("returns false when no hints present and non-buttons pagination", () => {
            const props = makeProps({ pagination: "virtualScrolling", showNumberOfRows: false });
            expect(requestTotalCount(props as MainGateProps)).toBe(false);
        });
    });

    describe("dynamicPageEnabled", () => {
        it("is true when dynamicPage attribute exists", () => {
            const props = makeProps({ dynamicPage: {}, pagination: "buttons" });
            expect(dynamicPageEnabled(props as MainGateProps)).toBe(true);
        });

        it("stays true for limit-based pagination", () => {
            const props = makeProps({ dynamicPage: {}, pagination: "virtualScrolling" });
            expect(dynamicPageEnabled(props as MainGateProps)).toBe(true);
        });

        it("is false when no attribute provided", () => {
            const props = makeProps({ pagination: "virtualScrolling" });
            expect(dynamicPageEnabled(props as MainGateProps)).toBe(false);
        });
    });

    describe("dynamicPageSizeEnabled", () => {
        it("is true when dynamicPageSize attribute exists", () => {
            const props = makeProps({ dynamicPageSize: {}, pagination: "buttons" });
            expect(dynamicPageSizeEnabled(props as MainGateProps)).toBe(true);
        });

        it("stays true for limit-based pagination", () => {
            const props = makeProps({ dynamicPageSize: {}, pagination: "loadMore" });
            expect(dynamicPageSizeEnabled(props as MainGateProps)).toBe(true);
        });

        it("is false when no attribute provided", () => {
            const props = makeProps({ pagination: "loadMore" });
            expect(dynamicPageSizeEnabled(props as MainGateProps)).toBe(false);
        });
    });
});
