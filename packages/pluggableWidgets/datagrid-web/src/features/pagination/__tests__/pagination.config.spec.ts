import { MainGateProps } from "typings/MainGateProps";
import { dynamicPageEnabled, dynamicPageSizeEnabled, requestTotalCount } from "../pagination.config";

function makeProps(overrides = {}): Partial<MainGateProps> {
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
        it("returns true when totalCountValue attribute is mapped regardless of pagination mode", () => {
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

        it("returns false for virtual scrolling without totalCountValue or showNumberOfRows", () => {
            const props = makeProps({ pagination: "virtualScrolling", showNumberOfRows: false });
            expect(requestTotalCount(props as MainGateProps)).toBe(false);
        });
    });

    describe("dynamicPageEnabled", () => {
        it("is true when dynamicPage attribute is mapped for buttons mode", () => {
            const props = makeProps({ dynamicPage: {}, pagination: "buttons" });
            expect(dynamicPageEnabled(props as MainGateProps)).toBe(true);
        });

        it("is true when dynamicPage attribute is mapped for virtualScrolling mode", () => {
            const props = makeProps({ dynamicPage: {}, pagination: "virtualScrolling" });
            expect(dynamicPageEnabled(props as MainGateProps)).toBe(true);
        });

        it("is true when dynamicPage attribute is mapped for loadMore mode", () => {
            const props = makeProps({ dynamicPage: {}, pagination: "loadMore" });
            expect(dynamicPageEnabled(props as MainGateProps)).toBe(true);
        });

        it("is false when no dynamicPage attribute is provided", () => {
            const props = makeProps({ pagination: "virtualScrolling" });
            expect(dynamicPageEnabled(props as MainGateProps)).toBe(false);
        });
    });

    describe("dynamicPageSizeEnabled", () => {
        it("is true when dynamicPageSize attribute is mapped for buttons mode", () => {
            const props = makeProps({ dynamicPageSize: {}, pagination: "buttons" });
            expect(dynamicPageSizeEnabled(props as MainGateProps)).toBe(true);
        });

        it("is true when dynamicPageSize attribute is mapped for virtualScrolling mode", () => {
            const props = makeProps({ dynamicPageSize: {}, pagination: "virtualScrolling" });
            expect(dynamicPageSizeEnabled(props as MainGateProps)).toBe(true);
        });

        it("is true when dynamicPageSize attribute is mapped for loadMore mode", () => {
            const props = makeProps({ dynamicPageSize: {}, pagination: "loadMore" });
            expect(dynamicPageSizeEnabled(props as MainGateProps)).toBe(true);
        });

        it("is false when no dynamicPageSize attribute is provided", () => {
            const props = makeProps({ pagination: "loadMore" });
            expect(dynamicPageSizeEnabled(props as MainGateProps)).toBe(false);
        });
    });
});
