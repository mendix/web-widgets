import { FREE_ASPECT, resolveAspectRatio, toCropAspect } from "../aspectRatio";

describe("resolveAspectRatio", () => {
    test("returns FREE_ASPECT for 'free'", () => {
        expect(resolveAspectRatio("free", 0, 0)).toBe(FREE_ASPECT);
    });

    test("returns 1 for 'square'", () => {
        expect(resolveAspectRatio("square", 0, 0)).toBe(1);
    });

    test("returns 16/9 for 'landscape16x9'", () => {
        expect(resolveAspectRatio("landscape16x9", 0, 0)).toBeCloseTo(16 / 9);
    });

    test("returns 4/3 for 'landscape4x3'", () => {
        expect(resolveAspectRatio("landscape4x3", 0, 0)).toBeCloseTo(4 / 3);
    });

    test("returns 3/4 for 'portrait3x4'", () => {
        expect(resolveAspectRatio("portrait3x4", 0, 0)).toBeCloseTo(3 / 4);
    });

    test("returns custom width/height when both positive", () => {
        expect(resolveAspectRatio("custom", 21, 9)).toBeCloseTo(21 / 9);
    });

    // A side that is knowable but unusable (zero/negative) is RESOLVED, not pending — it must
    // degrade to free aspect so a bad expression still yields a crop box.
    test.each([
        ["width is zero", 0, 9],
        ["height is zero", 16, 0],
        ["width is negative", -1, 9],
        ["height is negative", 16, -9]
    ])("returns FREE_ASPECT for custom when %s", (_label, width, height) => {
        expect(resolveAspectRatio("custom", width, height)).toBe(FREE_ASPECT);
    });

    // Sides come from expressions now, so either can be undefined while it is still loading with
    // no previous value. That is "not knowable yet" — distinct from free — and must not be NaN.
    test.each([
        ["both sides undefined", undefined, undefined],
        ["width undefined", undefined, 9],
        ["height undefined", 16, undefined]
    ])("returns undefined (pending) for custom when %s", (_label, width, height) => {
        expect(resolveAspectRatio("custom", width, height)).toBeUndefined();
    });
});

describe("toCropAspect", () => {
    // The crop layer only understands "positive ratio" or "unconstrained", so both pending and
    // the FREE_ASPECT sentinel collapse to undefined — a negative would break the geometry.
    test.each([
        ["a positive ratio passes through", 16 / 9, 16 / 9],
        ["FREE_ASPECT becomes undefined", FREE_ASPECT, undefined],
        ["pending becomes undefined", undefined, undefined],
        ["zero becomes undefined", 0, undefined]
    ])("%s", (_label, input, expected) => {
        expect(toCropAspect(input)).toBe(expected);
    });
});
