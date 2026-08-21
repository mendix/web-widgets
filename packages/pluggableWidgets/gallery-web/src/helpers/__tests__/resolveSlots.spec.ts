import { PagingAlignment } from "../pagingAlignment";
import { BarSlots, resolveSlots, ResolveSlotsParams } from "../resolveSlots";

const slots = (params: Partial<ResolveSlotsParams> = {}): BarSlots =>
    resolveSlots({
        alignment: "right",
        hasCounter: false,
        hasLoadMore: false,
        hasPagination: true,
        ...params
    });

const ALIGNMENTS: PagingAlignment[] = ["left", "center", "right"];

describe("resolveSlots", () => {
    describe("pagination alone", () => {
        it("places pagination in the start slot when aligned left", () => {
            expect(slots({ alignment: "left" })).toEqual({ start: "pagination", middle: null, end: null });
        });

        it("places pagination in the middle slot when aligned center", () => {
            expect(slots({ alignment: "center" })).toEqual({ start: null, middle: "pagination", end: null });
        });

        it("places pagination in the end slot when aligned right", () => {
            expect(slots({ alignment: "right" })).toEqual({ start: null, middle: null, end: "pagination" });
        });
    });

    describe("counter present", () => {
        it("displaces the counter to the end slot when pagination claims the start slot", () => {
            expect(slots({ alignment: "left", hasCounter: true })).toEqual({
                start: "pagination",
                middle: null,
                end: "counter"
            });
        });

        it("keeps the counter in the start slot when pagination claims the middle slot", () => {
            expect(slots({ alignment: "center", hasCounter: true })).toEqual({
                start: "counter",
                middle: "pagination",
                end: null
            });
        });

        it("keeps the counter in the start slot when pagination claims the end slot", () => {
            expect(slots({ alignment: "right", hasCounter: true })).toEqual({
                start: "counter",
                middle: null,
                end: "pagination"
            });
        });
    });

    describe("load more present", () => {
        it("displaces load more to the end slot when pagination claims the middle slot", () => {
            expect(slots({ alignment: "center", hasLoadMore: true })).toEqual({
                start: null,
                middle: "pagination",
                end: "loadMore"
            });
        });

        it("keeps load more in the middle slot when pagination claims the start slot", () => {
            expect(slots({ alignment: "left", hasLoadMore: true })).toEqual({
                start: "pagination",
                middle: "loadMore",
                end: null
            });
        });

        it("keeps load more in the middle slot when pagination claims the end slot", () => {
            expect(slots({ alignment: "right", hasLoadMore: true })).toEqual({
                start: null,
                middle: "loadMore",
                end: "pagination"
            });
        });
    });

    describe("all three elements present", () => {
        it("displaces the counter and keeps load more when aligned left", () => {
            expect(slots({ alignment: "left", hasCounter: true, hasLoadMore: true })).toEqual({
                start: "pagination",
                middle: "loadMore",
                end: "counter"
            });
        });

        it("displaces load more and keeps the counter when aligned center", () => {
            expect(slots({ alignment: "center", hasCounter: true, hasLoadMore: true })).toEqual({
                start: "counter",
                middle: "pagination",
                end: "loadMore"
            });
        });

        it("displaces nothing when aligned right", () => {
            expect(slots({ alignment: "right", hasCounter: true, hasLoadMore: true })).toEqual({
                start: "counter",
                middle: "loadMore",
                end: "pagination"
            });
        });
    });

    describe("pagination not visible", () => {
        it.each(ALIGNMENTS)("reserves no slot for pagination when aligned %s", alignment => {
            expect(slots({ alignment, hasPagination: false, hasCounter: true, hasLoadMore: true })).toEqual({
                start: "counter",
                middle: "loadMore",
                end: null
            });
        });

        it("returns an empty bar when nothing is visible", () => {
            expect(slots({ hasPagination: false })).toEqual({ start: null, middle: null, end: null });
        });
    });

    describe("invariants", () => {
        const combinations = ALIGNMENTS.flatMap(alignment =>
            [true, false].flatMap(hasCounter =>
                [true, false].flatMap(hasLoadMore =>
                    [true, false].map(hasPagination => ({ alignment, hasCounter, hasLoadMore, hasPagination }))
                )
            )
        );

        it.each(combinations)("never assigns an element twice (%j)", params => {
            const result = resolveSlots(params);
            const elements = [result.start, result.middle, result.end].filter(Boolean);

            expect(new Set(elements).size).toBe(elements.length);
        });

        it.each(combinations)("places every visible element exactly once (%j)", params => {
            const result = resolveSlots(params);
            const elements = [result.start, result.middle, result.end].filter(Boolean);
            const expected = [
                params.hasPagination ? "pagination" : null,
                params.hasCounter ? "counter" : null,
                params.hasLoadMore ? "loadMore" : null
            ].filter(Boolean);

            expect(elements.sort()).toEqual(expected.sort());
        });
    });
});
