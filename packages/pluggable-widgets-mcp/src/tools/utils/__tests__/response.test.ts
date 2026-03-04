import { describe, expect, it } from "vitest";
import {
    createErrorResponse,
    createStructuredError,
    createStructuredErrorResponse,
    createToolResponse
} from "@/tools/utils/response";

describe("createToolResponse", () => {
    it("returns content with text and no isError", () => {
        const result = createToolResponse("hello");
        expect(result).toEqual({
            content: [{ type: "text", text: "hello" }]
        });
        expect(result).not.toHaveProperty("isError");
    });
});

describe("createErrorResponse", () => {
    it("sets isError to true", () => {
        const result = createErrorResponse("something broke");
        expect(result.isError).toBe(true);
        expect(result.content[0].text).toBe("something broke");
    });
});

describe("createStructuredError", () => {
    it("creates an error with code and message", () => {
        const err = createStructuredError("ERR_NOT_FOUND", "Widget not found");
        expect(err.code).toBe("ERR_NOT_FOUND");
        expect(err.message).toBe("Widget not found");
        expect(err.suggestion).toBeUndefined();
        expect(err.details).toBeUndefined();
    });

    it("includes optional suggestion and details", () => {
        const err = createStructuredError("ERR_BUILD_TS", "Type error", {
            suggestion: "Check types",
            file: "src/Foo.tsx",
            line: 42,
            rawOutput: "raw stuff"
        });
        expect(err.suggestion).toBe("Check types");
        expect(err.details?.file).toBe("src/Foo.tsx");
        expect(err.details?.line).toBe(42);
        expect(err.details?.rawOutput).toBe("raw stuff");
    });
});

describe("createStructuredErrorResponse", () => {
    it("formats header with [CODE] message", () => {
        const resp = createStructuredErrorResponse(createStructuredError("ERR_NOT_FOUND", "Widget missing"));
        const text = resp.content[0].text;
        expect(text).toContain("[ERR_NOT_FOUND]");
        expect(text).toContain("Widget missing");
    });

    it("includes file location line when details.file is set", () => {
        const resp = createStructuredErrorResponse(
            createStructuredError("ERR_BUILD_TS", "Type error", {
                file: "src/Foo.tsx",
                line: 10,
                column: 5
            })
        );
        const text = resp.content[0].text;
        expect(text).toContain("src/Foo.tsx:10:5");
    });

    it("truncates rawOutput longer than 500 chars", () => {
        const longOutput = "x".repeat(600);
        const resp = createStructuredErrorResponse(
            createStructuredError("ERR_BUILD_UNKNOWN", "fail", { rawOutput: longOutput })
        );
        const text = resp.content[0].text;
        expect(text).toContain("...(truncated)");
        expect(text).not.toContain("x".repeat(600));
    });

    it("sets isError to true", () => {
        const resp = createStructuredErrorResponse(createStructuredError("ERR_NOT_FOUND", "gone"));
        expect(resp.isError).toBe(true);
    });
});
