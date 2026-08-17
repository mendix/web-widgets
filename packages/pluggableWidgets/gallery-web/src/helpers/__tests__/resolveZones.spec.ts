import { PagingAlignment } from "../pagingAlignment";
import { BarZones, resolveZones, ResolveZonesParams } from "../resolveZones";

const zones = (params: Partial<ResolveZonesParams> = {}): BarZones =>
    resolveZones({
        alignment: "right",
        hasCounter: false,
        hasLoadMore: false,
        hasPagination: true,
        ...params
    });

const ALIGNMENTS: PagingAlignment[] = ["left", "center", "right"];

describe("resolveZones", () => {
    describe("pagination alone", () => {
        it("places pagination in the start zone when aligned left", () => {
            expect(zones({ alignment: "left" })).toEqual({ start: "pagination", middle: null, end: null });
        });

        it("places pagination in the middle zone when aligned center", () => {
            expect(zones({ alignment: "center" })).toEqual({ start: null, middle: "pagination", end: null });
        });

        it("places pagination in the end zone when aligned right", () => {
            expect(zones({ alignment: "right" })).toEqual({ start: null, middle: null, end: "pagination" });
        });
    });

    describe("counter present", () => {
        it("displaces the counter to the end zone when pagination claims the start zone", () => {
            expect(zones({ alignment: "left", hasCounter: true })).toEqual({
                start: "pagination",
                middle: null,
                end: "counter"
            });
        });

        it("keeps the counter in the start zone when pagination claims the middle zone", () => {
            expect(zones({ alignment: "center", hasCounter: true })).toEqual({
                start: "counter",
                middle: "pagination",
                end: null
            });
        });

        it("keeps the counter in the start zone when pagination claims the end zone", () => {
            expect(zones({ alignment: "right", hasCounter: true })).toEqual({
                start: "counter",
                middle: null,
                end: "pagination"
            });
        });
    });

    describe("load more present", () => {
        it("displaces load more to the end zone when pagination claims the middle zone", () => {
            expect(zones({ alignment: "center", hasLoadMore: true })).toEqual({
                start: null,
                middle: "pagination",
                end: "loadMore"
            });
        });

        it("keeps load more in the middle zone when pagination claims the start zone", () => {
            expect(zones({ alignment: "left", hasLoadMore: true })).toEqual({
                start: "pagination",
                middle: "loadMore",
                end: null
            });
        });

        it("keeps load more in the middle zone when pagination claims the end zone", () => {
            expect(zones({ alignment: "right", hasLoadMore: true })).toEqual({
                start: null,
                middle: "loadMore",
                end: "pagination"
            });
        });
    });

    describe("all three occupants present", () => {
        it("displaces the counter and keeps load more when aligned left", () => {
            expect(zones({ alignment: "left", hasCounter: true, hasLoadMore: true })).toEqual({
                start: "pagination",
                middle: "loadMore",
                end: "counter"
            });
        });

        it("displaces load more and keeps the counter when aligned center", () => {
            expect(zones({ alignment: "center", hasCounter: true, hasLoadMore: true })).toEqual({
                start: "counter",
                middle: "pagination",
                end: "loadMore"
            });
        });

        it("displaces nothing when aligned right", () => {
            expect(zones({ alignment: "right", hasCounter: true, hasLoadMore: true })).toEqual({
                start: "counter",
                middle: "loadMore",
                end: "pagination"
            });
        });
    });

    describe("pagination not visible", () => {
        it.each(ALIGNMENTS)("reserves no zone for pagination when aligned %s", alignment => {
            expect(zones({ alignment, hasPagination: false, hasCounter: true, hasLoadMore: true })).toEqual({
                start: "counter",
                middle: "loadMore",
                end: null
            });
        });

        it("returns an empty bar when nothing is visible", () => {
            expect(zones({ hasPagination: false })).toEqual({ start: null, middle: null, end: null });
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

        it.each(combinations)("never assigns an occupant twice (%j)", params => {
            const result = resolveZones(params);
            const occupants = [result.start, result.middle, result.end].filter(Boolean);

            expect(new Set(occupants).size).toBe(occupants.length);
        });

        it.each(combinations)("places every visible occupant exactly once (%j)", params => {
            const result = resolveZones(params);
            const occupants = [result.start, result.middle, result.end].filter(Boolean);
            const expected = [
                params.hasPagination ? "pagination" : null,
                params.hasCounter ? "counter" : null,
                params.hasLoadMore ? "loadMore" : null
            ].filter(Boolean);

            expect(occupants.sort()).toEqual(expected.sort());
        });
    });
});
