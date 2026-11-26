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

// A raw-string attr() yields one CSS string, which font-family reads as a single family name,
// so a list such as `impact, sans-serif` would fall back to the browser default font.
describe("RichTextFormatStyle.scss font families", () => {
    const css = compile(join(__dirname, "../ui/RichTextFormatStyle.scss")).css;

    it("inserts the text and list marker font families as a family list", () => {
        expect(css).toContain("font-family: attr(data-font-family type(*));");
        expect(css).toContain("--rt-marker-font-family: attr(data-marker-font-family type(*));");
        expect(css).not.toContain("raw-string");
    });
});

// Class style mode saves table, column and cell sizes as data attributes only (no `style`
// attribute), so the sizes must come from these rules. The attribute selectors keep them
// off inline-mode tables.
describe("RichTextFormatStyle.scss table sizes", () => {
    const css = compile(join(__dirname, "../ui/RichTextFormatStyle.scss")).css;

    it.each([
        [".widget-rich-text table[data-width] {", "width: attr(data-width type(<length-percentage>));"],
        [".widget-rich-text table[data-min-height] {", "min-height: attr(data-min-height type(<length-percentage>));"],
        [".widget-rich-text col[data-col-width] {", "width: attr(data-col-width type(<length-percentage>));"],
        [
            ".widget-rich-text td[data-cell-width],\n.widget-rich-text th[data-cell-width] {",
            "width: attr(data-cell-width type(<length-percentage>));"
        ],
        [
            ".widget-rich-text td[data-cell-height],\n.widget-rich-text th[data-cell-height] {",
            "height: attr(data-cell-height type(<length-percentage>));"
        ]
    ])("renders %s from a typed attr()", (selector, declaration) => {
        expect(css).toContain(`${selector}\n  ${declaration}\n}`);
    });
});
