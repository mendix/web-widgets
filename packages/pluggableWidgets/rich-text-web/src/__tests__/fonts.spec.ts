import { FONT_LIST, FontClassAttributor, FontStyleAttributor, formatCustomFonts } from "../utils/formats/fonts";

// parchment ClassAttributor and StyleAttributor operate directly on HTMLElement nodes —
// no Quill instance is needed for unit-level attribute tests.

function makeSpan(): HTMLElement {
    return document.createElement("span");
}

// FontStyleAttributor --------------------------------------------------------

describe("FontStyleAttributor", () => {
    let attr: FontStyleAttributor;

    beforeEach(() => {
        attr = new FontStyleAttributor([]);
    });

    it("adds font-family style for a known font value", () => {
        const node = makeSpan();
        const result = attr.add(node, "arial");
        expect(result).toBe(true);
        expect(node.style.fontFamily).toMatch(/arial/i);
        expect(node.dataset.value).toBe("arial");
    });

    it("returns false for an unknown font value", () => {
        const node = makeSpan();
        const result = attr.add(node, "not-a-real-font");
        expect(result).toBe(false);
        expect(node.style.fontFamily).toBe("");
    });

    it("reads back the value via dataset.value", () => {
        const node = makeSpan();
        attr.add(node, "courier-new");
        expect(attr.value(node)).toBe("courier-new");
    });

    it("returns empty string for a node with no dataset.value", () => {
        const node = makeSpan();
        expect(attr.value(node)).toBe("");
    });

    it("applies custom fonts passed to the constructor", () => {
        const custom = new FontStyleAttributor([
            { value: "my-font", description: "My Font", style: "MyFont, sans-serif" }
        ]);
        const node = makeSpan();
        expect(custom.add(node, "my-font")).toBe(true);
        expect(node.style.fontFamily).toMatch(/MyFont/i);
    });

    it("FONT_LIST contains all 13 fonts including serif", () => {
        const values = FONT_LIST.map(f => f.value);
        expect(values).toContain("serif");
        expect(values).toHaveLength(13);
    });
});

// FontClassAttributor --------------------------------------------------------

describe("FontClassAttributor", () => {
    let attr: FontClassAttributor;

    beforeEach(() => {
        attr = new FontClassAttributor([]);
    });

    it("adds font-family-<value> class for a known font value", () => {
        const node = makeSpan();
        const result = attr.add(node, "arial");
        expect(result).toBe(true);
        expect(node.classList.contains("font-family-arial")).toBe(true);
        expect(node.dataset.value).toBe("arial");
    });

    it("returns false for an unknown font value and adds no class", () => {
        const node = makeSpan();
        const result = attr.add(node, "not-a-real-font");
        expect(result).toBe(false);
        const hasClass = Array.from(node.classList).some(c => c.startsWith("font-family-"));
        expect(hasClass).toBe(false);
    });

    it("reads back the value via dataset.value", () => {
        const node = makeSpan();
        attr.add(node, "impact");
        expect(attr.value(node)).toBe("impact");
    });

    it("returns empty string for a node with no dataset.value", () => {
        const node = makeSpan();
        expect(attr.value(node)).toBe("");
    });

    it("adds font-family-serif class for the serif font (Critical #3 regression guard)", () => {
        const node = makeSpan();
        const result = attr.add(node, "serif");
        expect(result).toBe(true);
        expect(node.classList.contains("font-family-serif")).toBe(true);
    });

    it("applies custom fonts passed to the constructor", () => {
        const custom = new FontClassAttributor([
            { value: "my-font", description: "My Font", style: "MyFont, sans-serif" }
        ]);
        const node = makeSpan();
        expect(custom.add(node, "my-font")).toBe(true);
        expect(node.classList.contains("font-family-my-font")).toBe(true);
    });

    it("emits class-based name, not inline style", () => {
        const node = makeSpan();
        attr.add(node, "helvetica");
        expect(node.style.fontFamily).toBe("");
        expect(node.classList.contains("font-family-helvetica")).toBe(true);
    });
});

// formatCustomFonts ----------------------------------------------------------

describe("formatCustomFonts", () => {
    it("maps custom font objects to FONT_LIST shape", () => {
        const result = formatCustomFonts([{ fontName: "My Brand Font", fontStyle: "MyBrandFont, sans-serif" }]);
        expect(result).toEqual([
            { value: "my-brand-font", description: "My Brand Font", style: "MyBrandFont, sans-serif" }
        ]);
    });

    it("lowercases and hyphenates multi-word font names", () => {
        const result = formatCustomFonts([{ fontName: "Open Sans", fontStyle: "Open Sans, sans-serif" }]);
        expect(result[0].value).toBe("open-sans");
    });

    it("returns an empty array when called with no arguments", () => {
        expect(formatCustomFonts()).toEqual([]);
    });

    it("returns an empty array for an empty input", () => {
        expect(formatCustomFonts([])).toEqual([]);
    });

    it("handles undefined fontName gracefully", () => {
        const result = formatCustomFonts([{ fontName: undefined as any, fontStyle: "serif" }]);
        expect(result[0].value).toBe("");
    });
});
