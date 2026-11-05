import { buildInitialCrop, DEFAULT_INITIAL_CROP_SIZE } from "../initialCrop";

function makeImg(naturalW: number, naturalH: number, renderedW = naturalW, renderedH = naturalH): HTMLImageElement {
    const img = new Image();
    Object.defineProperty(img, "naturalWidth", { value: naturalW });
    Object.defineProperty(img, "naturalHeight", { value: naturalH });
    Object.defineProperty(img, "width", { value: renderedW });
    Object.defineProperty(img, "height", { value: renderedH });
    return img;
}

// 400x300 landscape image; percent crops are expressed per axis.
const landscape = makeImg(400, 300);

describe("buildInitialCrop", () => {
    test("free aspect covers the configured share of both axes, centered", () => {
        const { percentCrop } = buildInitialCrop(landscape, undefined, DEFAULT_INITIAL_CROP_SIZE);
        expect(percentCrop.unit).toBe("%");
        expect(percentCrop.width).toBeCloseTo(80, 5);
        expect(percentCrop.height).toBeCloseTo(80, 5);
        expect(percentCrop.x).toBeCloseTo(10, 5);
        expect(percentCrop.y).toBeCloseTo(10, 5);
    });

    test("100 selects the full image for free aspect", () => {
        const { percentCrop } = buildInitialCrop(landscape, undefined, 100);
        expect(percentCrop.width).toBeCloseTo(100, 5);
        expect(percentCrop.height).toBeCloseTo(100, 5);
        expect(percentCrop.x).toBeCloseTo(0, 5);
        expect(percentCrop.y).toBeCloseTo(0, 5);
    });

    test("width-limited ratio scales the full-width box", () => {
        // Largest 16:9 box is 400x225 px (100% x 75%); half of it is 50% x 37.5%.
        const { percentCrop } = buildInitialCrop(landscape, 16 / 9, 50);
        expect(percentCrop.width).toBeCloseTo(50, 5);
        expect(percentCrop.height).toBeCloseTo(37.5, 5);
        expect(percentCrop.x).toBeCloseTo(25, 5);
        expect(percentCrop.y).toBeCloseTo(31.25, 5);
    });

    test("height-limited ratio scales the full-height box instead of clamping to it", () => {
        // Largest square is 300x300 px (75% x 100%); 80% of it is 60% x 80%.
        const { percentCrop } = buildInitialCrop(landscape, 1, 80);
        expect(percentCrop.width).toBeCloseTo(60, 5);
        expect(percentCrop.height).toBeCloseTo(80, 5);
        expect(percentCrop.x).toBeCloseTo(20, 5);
        expect(percentCrop.y).toBeCloseTo(10, 5);
    });

    test("every size yields a distinct box for a height-limited ratio", () => {
        // Largest 3:4 box is 225x300 px (56.25% x 100%).
        expect(buildInitialCrop(landscape, 3 / 4, 60).percentCrop.height).toBeCloseTo(60, 5);
        expect(buildInitialCrop(landscape, 3 / 4, 100).percentCrop.height).toBeCloseTo(100, 5);
        expect(buildInitialCrop(landscape, 3 / 4, 100).percentCrop.width).toBeCloseTo(56.25, 5);
    });

    test.each([
        [0, 1],
        [-20, 1],
        [150, 100],
        [Number.NaN, DEFAULT_INITIAL_CROP_SIZE]
    ])("treats size %p as %p", (input, expected) => {
        const { percentCrop } = buildInitialCrop(landscape, undefined, input);
        expect(percentCrop.width).toBeCloseTo(expected, 5);
        expect(percentCrop.height).toBeCloseTo(expected, 5);
    });

    test("maps the pixel crop to the rendered size, not the natural size", () => {
        const scaled = makeImg(800, 600, 400, 300);
        const { pixelCrop } = buildInitialCrop(scaled, undefined, 50);
        expect(pixelCrop.unit).toBe("px");
        expect(pixelCrop.width).toBeCloseTo(200, 5);
        expect(pixelCrop.height).toBeCloseTo(150, 5);
        expect(pixelCrop.x).toBeCloseTo(100, 5);
        expect(pixelCrop.y).toBeCloseTo(75, 5);
    });
});
