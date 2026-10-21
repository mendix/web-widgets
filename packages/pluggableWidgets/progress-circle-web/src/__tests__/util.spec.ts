import { calculatePercentage } from "../util";

describe("calculatePercentage", () => {
    it("clamps values above the maximum to 100 by default", () => {
        expect(calculatePercentage(150, 0, 100)).toBe(100);
    });

    it("returns the actual percentage above the maximum when allowed", () => {
        expect(calculatePercentage(150, 0, 100, true)).toBe(150);
        expect(calculatePercentage(140, 20, 100, true)).toBe(150);
    });

    it("returns 100 when allowed but the range is empty", () => {
        expect(calculatePercentage(150, 100, 100, true)).toBe(100);
    });

    it("clamps values below the minimum to 0", () => {
        expect(calculatePercentage(-10, 0, 100, true)).toBe(0);
    });
});
