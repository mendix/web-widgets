import { translateFilters } from "../filters";

describe("translateFilters", () => {
    const cases = [
        [">", "greater"],
        [">=", "greaterEqual"],
        ["=", "equal"],
        ["!=", "notEqual"],
        ["<", "smaller"],
        ["<=", "smallerEqual"]
    ];

    test.each(cases)("map filter name '%' to internal key '&'", (name, key) => {
        expect(translateFilters([{ type: name, value: 3 }])).toStrictEqual({ type: key, value: 3 });
    });
});
