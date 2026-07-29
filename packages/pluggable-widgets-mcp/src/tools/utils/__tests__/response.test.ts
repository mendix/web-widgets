import { describe, expect, it } from "vitest";
import { fail, ok } from "@/tools/utils/response";

describe("ok", () => {
    it("returns text content with no error flag", () => {
        const response = ok("all good");
        expect(response.content).toEqual([{ type: "text", text: "all good" }]);
        expect(response.isError).toBeUndefined();
    });
});

describe("fail", () => {
    it("flags the response as an error", () => {
        expect(fail("ERR_NOT_FOUND", "missing").isError).toBe(true);
    });

    it("renders the code into the text, which is all the model sees", () => {
        expect(fail("ERR_NOT_FOUND", "missing").content[0].text).toContain("[ERR_NOT_FOUND] missing");
    });

    it("includes the suggestion when given", () => {
        const text = fail("ERR_MPK_NOT_FOUND", "no mpk", { suggestion: "Run build-widget first." }).content[0].text;
        expect(text).toContain("Suggestion: Run build-widget first.");
    });

    it("formats file, line and column as file:line:column", () => {
        const text = fail("ERR_BUILD_FAILED", "boom", { file: "src/W.tsx", line: 4, column: 25 }).content[0].text;
        expect(text).toContain("File: src/W.tsx:4:25");
    });

    it("keeps a column that arrives without a line", () => {
        // The previous implementation dropped `column` unless `file`, `line` or raw output was set.
        const text = fail("ERR_BUILD_FAILED", "boom", { file: "src/W.tsx", column: 7 }).content[0].text;
        expect(text).toContain("src/W.tsx:7");
    });

    it("omits the file line entirely when there is no file", () => {
        expect(fail("ERR_BUILD_FAILED", "boom").content[0].text).not.toContain("File:");
    });

    it("truncates long details", () => {
        const text = fail("ERR_BUILD_FAILED", "boom", { details: "x".repeat(900) }).content[0].text;
        expect(text).toContain("...(truncated)");
        expect(text.length).toBeLessThan(700);
    });

    it("leaves short details intact", () => {
        expect(fail("ERR_BUILD_FAILED", "boom", { details: "short" }).content[0].text).toContain("short");
    });
});
