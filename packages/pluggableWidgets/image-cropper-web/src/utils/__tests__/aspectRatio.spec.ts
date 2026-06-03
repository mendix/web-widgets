import { resolveAspectRatio } from "../aspectRatio";

describe("resolveAspectRatio", () => {
    test("returns undefined for 'free'", () => {
        expect(resolveAspectRatio("free", 0, 0)).toBeUndefined();
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

    test("returns undefined when custom width is zero", () => {
        expect(resolveAspectRatio("custom", 0, 9)).toBeUndefined();
    });

    test("returns undefined when custom height is zero", () => {
        expect(resolveAspectRatio("custom", 16, 0)).toBeUndefined();
    });

    test("returns undefined when custom width is negative", () => {
        expect(resolveAspectRatio("custom", -1, 9)).toBeUndefined();
    });
});
