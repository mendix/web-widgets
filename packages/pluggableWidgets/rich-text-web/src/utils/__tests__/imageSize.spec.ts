import { toCssLength, toHtmlDimension } from "../imageSize";

describe("toCssLength", () => {
    it.each([
        ["300", "300px"],
        ["300.5", "300.5px"],
        [300, "300px"],
        ["300px", "300px"],
        [" 300 ", "300px"],
        ["50%", "50%"],
        ["20em", "20em"],
        ["auto", "auto"]
    ])("converts %p to %p", (input, expected) => {
        expect(toCssLength(input)).toBe(expected);
    });

    it.each([null, undefined, "", "   "])("returns undefined for %p", input => {
        expect(toCssLength(input)).toBeUndefined();
    });
});

describe("toHtmlDimension", () => {
    it.each([
        ["300", "300"],
        ["300px", "300"],
        ["300PX", "300"],
        ["300.5px", "300.5"],
        [300, "300"],
        ["50%", "50%"]
    ])("converts %p to %p", (input, expected) => {
        expect(toHtmlDimension(input)).toBe(expected);
    });

    it.each([null, undefined, "", "20em", "auto", "inherit", "calc(100% - 10px)"])(
        "returns undefined for %p",
        input => {
            expect(toHtmlDimension(input)).toBeUndefined();
        }
    );
});
