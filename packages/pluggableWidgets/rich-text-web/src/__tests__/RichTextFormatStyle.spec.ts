/**
 * @jest-environment node
 */
import { join } from "path";
import { compile } from "sass";

// Class style mode renders table/cell borders purely from CSS, so guard the compiled output:
// Sass treats `or` as a boolean operator and silently drops attr() fallbacks.
describe("RichTextFormatStyle.scss table borders", () => {
    const css = compile(join(__dirname, "../ui/RichTextFormatStyle.scss")).css;

    it("scopes the border rule to the table, cell and generic border classes", () => {
        expect(css).toContain(
            ".widget-rich-text .has-table-border,\n.widget-rich-text .has-cell-border,\n.widget-rich-text .has-border {"
        );
    });

    it("reads each border property with a typed attr() and its own comma fallback", () => {
        expect(css).toContain("border-width: attr(data-border-width type(<length>), 1px);");
        expect(css).toContain("border-style: attr(data-border-style type(<custom-ident>), solid);");
        expect(css).toContain(
            "border-color: attr(data-border-color type(<color>), var(--color-neutral-300, #d9d9d9));"
        );
    });

    it("does not emit the broken unit-typed or fallback-less border declarations", () => {
        expect(css).not.toContain("attr(data-border-width px)");
        expect(css).not.toContain("border-style: attr(data-border-style type(*));");
        expect(css).not.toContain("border-color: attr(data-border-color type(<color>));");
        expect(css).not.toMatch(/border-(width|style|color): [^;]*\bor\b/);
    });
});
