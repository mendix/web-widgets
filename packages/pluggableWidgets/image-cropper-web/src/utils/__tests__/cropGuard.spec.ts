import type { PixelCrop } from "react-image-crop";
import { isStrayCrop, MIN_DRAW_FRACTION } from "../cropGuard";

const px = (width: number, height: number): PixelCrop => ({ unit: "px", x: 0, y: 0, width, height });
const display = { width: 300, height: 200 };

describe("isStrayCrop", () => {
    test("treats a zero-size crop (bare click) as stray", () => {
        expect(isStrayCrop(px(0, 0), display)).toBe(true);
    });

    test("treats a sub-threshold crop as stray", () => {
        // threshold = 300 * 0.02 = 6 px wide, 200 * 0.02 = 4 px tall
        expect(isStrayCrop(px(5, 3), display)).toBe(true);
    });

    test("keeps a crop at or above the threshold on both axes", () => {
        const minW = display.width * MIN_DRAW_FRACTION;
        const minH = display.height * MIN_DRAW_FRACTION;
        expect(isStrayCrop(px(minW, minH), display)).toBe(false);
        expect(isStrayCrop(px(240, 160), display)).toBe(false);
    });

    test("stray when only one axis is below threshold", () => {
        expect(isStrayCrop(px(240, 2), display)).toBe(true);
        expect(isStrayCrop(px(2, 160), display)).toBe(true);
    });

    test("never filters before the image has loaded (unknown display size)", () => {
        expect(isStrayCrop(px(0, 0), null)).toBe(false);
    });
});
