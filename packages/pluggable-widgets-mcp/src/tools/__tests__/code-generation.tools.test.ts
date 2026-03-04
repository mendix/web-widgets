import { describe, expect, it } from "vitest";
import { detectTemplateMismatch } from "@/tools/code-generation.tools";
import type { PropertyDefinition } from "@/generators/types";

function prop(key: string, type: PropertyDefinition["type"]): PropertyDefinition {
    return { key, type, caption: key };
}

describe("detectTemplateMismatch", () => {
    it("warns: button pattern + no action → disabled", () => {
        const result = detectTemplateMismatch("button", [prop("caption", "textTemplate")]);
        expect(result).not.toBeNull();
        expect(result).toContain("permanently disabled");
    });

    it("warns: button pattern + no caption → empty text", () => {
        const result = detectTemplateMismatch("button", [prop("onClick", "action")]);
        expect(result).not.toBeNull();
        expect(result).toContain("empty text");
    });

    it("null: button pattern + action + textTemplate → OK", () => {
        const result = detectTemplateMismatch("button", [prop("onClick", "action"), prop("caption", "textTemplate")]);
        expect(result).toBeNull();
    });

    it("null: button pattern + action + string → OK", () => {
        const result = detectTemplateMismatch("button", [prop("onClick", "action"), prop("label", "string")]);
        expect(result).toBeNull();
    });

    it("warns: display pattern + only integer → read-only", () => {
        const result = detectTemplateMismatch("display", [prop("count", "integer")]);
        expect(result).not.toBeNull();
        expect(result).toContain("read-only");
    });

    it("null: display pattern + textTemplate → OK", () => {
        const result = detectTemplateMismatch("display", [prop("value", "textTemplate")]);
        expect(result).toBeNull();
    });

    it("null: display pattern + expression → OK", () => {
        const result = detectTemplateMismatch("display", [prop("computed", "expression")]);
        expect(result).toBeNull();
    });

    it("warns: input pattern + no attribute", () => {
        const result = detectTemplateMismatch("input", [prop("onChange", "action")]);
        expect(result).not.toBeNull();
        expect(result).toContain("attribute");
    });

    it("null: input pattern + attribute → OK", () => {
        const result = detectTemplateMismatch("input", [prop("value", "attribute")]);
        expect(result).toBeNull();
    });

    it("warns: container pattern + no widgets", () => {
        const result = detectTemplateMismatch("container", [prop("title", "textTemplate")]);
        expect(result).not.toBeNull();
        expect(result).toContain("widgets");
    });

    it("null: container pattern + widgets → OK", () => {
        const result = detectTemplateMismatch("container", [prop("content", "widgets")]);
        expect(result).toBeNull();
    });

    it("warns: dataList pattern + missing datasource", () => {
        const result = detectTemplateMismatch("dataList", [prop("content", "widgets")]);
        expect(result).not.toBeNull();
        expect(result).toContain("datasource");
    });

    it("warns: dataList pattern + missing widgets", () => {
        const result = detectTemplateMismatch("dataList", [prop("items", "datasource")]);
        expect(result).not.toBeNull();
        expect(result).toContain("widgets");
    });

    it("warns: dataList pattern + both missing", () => {
        const result = detectTemplateMismatch("dataList", [prop("title", "string")]);
        expect(result).not.toBeNull();
        expect(result).toContain("datasource");
        expect(result).toContain("widgets");
    });

    it("null: dataList pattern + datasource + widgets → OK", () => {
        const result = detectTemplateMismatch("dataList", [prop("items", "datasource"), prop("content", "widgets")]);
        expect(result).toBeNull();
    });
});
