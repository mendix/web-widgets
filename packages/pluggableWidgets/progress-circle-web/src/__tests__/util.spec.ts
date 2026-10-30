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

    it("returns 100 when allowed but the maximum is lower than the minimum", () => {
        expect(calculatePercentage(120, 100, 50, true)).toBe(100);
        expect(calculatePercentage(120, 100, 50)).toBe(100);
    });

    it("rounds decimal values without floating-point errors", () => {
        expect(calculatePercentage(100.5, 0, 100, true)).toBe(101);
        expect(calculatePercentage(1.005, 0, 1, true)).toBe(101);
        expect(calculatePercentage(50.5, 0, 100)).toBe(51);
        expect(calculatePercentage(100.4, 0, 100, true)).toBe(100);
    });

    it("clamps values below the minimum to 0", () => {
        expect(calculatePercentage(-10, 0, 100, true)).toBe(0);
    });
});
