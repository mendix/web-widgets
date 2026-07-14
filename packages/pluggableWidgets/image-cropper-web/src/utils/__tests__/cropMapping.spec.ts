import { normalizeRotation, rotatedCanvasSize } from "../cropMapping";

describe("normalizeRotation", () => {
    test.each([
        [0, 0],
        [90, 90],
        [180, 180],
        [270, 270],
        [360, 0],
        [-90, 270],
        [450, 90],
        [44, 0],
        [46, 90]
    ])("snaps %i° to %i°", (input, expected) => {
        expect(normalizeRotation(input)).toBe(expected);
    });
});

describe("rotatedCanvasSize", () => {
    test("keeps dimensions for 0/180", () => {
        expect(rotatedCanvasSize(100, 60, 0)).toEqual({ width: 100, height: 60 });
        expect(rotatedCanvasSize(100, 60, 180)).toEqual({ width: 100, height: 60 });
    });
    test("swaps dimensions for 90/270", () => {
        expect(rotatedCanvasSize(100, 60, 90)).toEqual({ width: 60, height: 100 });
        expect(rotatedCanvasSize(100, 60, 270)).toEqual({ width: 60, height: 100 });
    });
});
