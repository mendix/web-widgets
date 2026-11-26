import { normalizeStartInput } from "../listHelpers";

describe("normalizeStartInput", () => {
    const max = 9999;

    it.each([
        ["", 5, 1],
        ["   ", 5, 1],
        ["1", 5, 1],
        ["12", 5, 12],
        [" 8 ", 5, 8],
        ["0", 5, 5],
        ["-2", 5, 5],
        ["2.5", 5, 5],
        ["1e3", 5, 5],
        ["abc", 5, 5],
        ["9999", 5, 9999],
        ["20000", 5, 9999]
    ])("maps %p with current %p to %p", (raw, current, expected) => {
        expect(normalizeStartInput(raw, current, max)).toBe(expected);
    });
});
