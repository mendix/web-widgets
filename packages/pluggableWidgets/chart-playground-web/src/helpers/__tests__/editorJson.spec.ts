import { prettifyJson } from "../editorJson";

describe("prettifyJson", () => {
    it("formats valid JSON with two-space indentation", () => {
        expect(prettifyJson('{"a":1}')).toBe('{\n  "a": 1\n}');
    });

    it("returns an error object string for invalid JSON", () => {
        expect(prettifyJson("{ not json")).toBe('{ "error": "invalid JSON" }');
    });
});
