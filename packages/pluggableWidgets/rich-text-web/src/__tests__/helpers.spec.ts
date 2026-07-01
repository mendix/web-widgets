import { INDENT_MAGIC_NUMBER, normalizeStyleAndClassAttribute } from "../utils/helpers";

function makeDoc(html: string): Document {
    const doc = document.implementation.createHTMLDocument();
    doc.body.innerHTML = html;
    return doc;
}

describe("INDENT_MAGIC_NUMBER", () => {
    it("equals 3", () => {
        expect(INDENT_MAGIC_NUMBER).toBe(3);
    });
});

describe("normalizeStyleAndClassAttribute — class mode (inline → class)", () => {
    it("converts padding-left:3em to ql-indent-1 and removes the style", () => {
        const doc = makeDoc(`<p style="padding-left: 3em">text</p>`);
        normalizeStyleAndClassAttribute(doc, "class");
        const p = doc.querySelector("p")!;
        expect(p.classList.contains("ql-indent-1")).toBe(true);
        expect(p.style.paddingLeft).toBe("");
    });

    it("converts padding-left:6em to ql-indent-2", () => {
        const doc = makeDoc(`<p style="padding-left: 6em">text</p>`);
        normalizeStyleAndClassAttribute(doc, "class");
        expect(doc.querySelector("p")!.classList.contains("ql-indent-2")).toBe(true);
    });

    it("converts padding-left:9em to ql-indent-3", () => {
        const doc = makeDoc(`<p style="padding-left: 9em">text</p>`);
        normalizeStyleAndClassAttribute(doc, "class");
        expect(doc.querySelector("p")!.classList.contains("ql-indent-3")).toBe(true);
    });

    it("rounds non-multiples of 3 using Math.round (5em → ql-indent-2)", () => {
        const doc = makeDoc(`<p style="padding-left: 5em">text</p>`);
        normalizeStyleAndClassAttribute(doc, "class");
        expect(doc.querySelector("p")!.classList.contains("ql-indent-2")).toBe(true);
    });

    it("ignores elements with padding-left:0em (zero is falsy — no class added)", () => {
        const doc = makeDoc(`<p style="padding-left: 0em">text</p>`);
        normalizeStyleAndClassAttribute(doc, "class");
        const p = doc.querySelector("p")!;
        const hasIndentClass = Array.from(p.classList).some(c => c.startsWith("ql-indent-"));
        expect(hasIndentClass).toBe(false);
    });

    it("converts RTL padding-right:3em to ql-indent-1 and removes the style", () => {
        const doc = makeDoc(`<p style="padding-right: 3em">text</p>`);
        normalizeStyleAndClassAttribute(doc, "class");
        const p = doc.querySelector("p")!;
        expect(p.classList.contains("ql-indent-1")).toBe(true);
        expect(p.style.paddingRight).toBe("");
    });

    it("converts multiple elements independently", () => {
        const doc = makeDoc(`
            <p style="padding-left: 3em">a</p>
            <p style="padding-left: 6em">b</p>
        `);
        normalizeStyleAndClassAttribute(doc, "class");
        const [a, b] = Array.from(doc.querySelectorAll("p"));
        expect(a.classList.contains("ql-indent-1")).toBe(true);
        expect(b.classList.contains("ql-indent-2")).toBe(true);
    });

    it("leaves elements without padding-left unchanged", () => {
        const doc = makeDoc(`<p>text</p>`);
        normalizeStyleAndClassAttribute(doc, "class");
        const p = doc.querySelector("p")!;
        const hasIndentClass = Array.from(p.classList).some(c => c.startsWith("ql-indent-"));
        expect(hasIndentClass).toBe(false);
    });
});

describe("normalizeStyleAndClassAttribute — inline mode (class → inline)", () => {
    it("converts ql-indent-1 to padding-left:3em and removes the class", () => {
        const doc = makeDoc(`<p class="ql-indent-1">text</p>`);
        normalizeStyleAndClassAttribute(doc, "inline");
        const p = doc.querySelector("p")!;
        expect(p.style.paddingLeft).toBe("3em");
        expect(p.classList.contains("ql-indent-1")).toBe(false);
    });

    it("converts ql-indent-2 to padding-left:6em", () => {
        const doc = makeDoc(`<p class="ql-indent-2">text</p>`);
        normalizeStyleAndClassAttribute(doc, "inline");
        expect(doc.querySelector("p")!.style.paddingLeft).toBe("6em");
    });

    it("converts ql-indent-3 to padding-left:9em", () => {
        const doc = makeDoc(`<p class="ql-indent-3">text</p>`);
        normalizeStyleAndClassAttribute(doc, "inline");
        expect(doc.querySelector("p")!.style.paddingLeft).toBe("9em");
    });

    it("uses padding-right for RTL elements (ql-direction-rtl)", () => {
        const doc = makeDoc(`<p class="ql-indent-1 ql-direction-rtl">text</p>`);
        normalizeStyleAndClassAttribute(doc, "inline");
        const p = doc.querySelector("p")!;
        expect(p.style.paddingRight).toBe("3em");
        expect(p.style.paddingLeft).toBe("");
    });

    it("removes ql-indent-* class after conversion", () => {
        const doc = makeDoc(`<p class="ql-indent-2">text</p>`);
        normalizeStyleAndClassAttribute(doc, "inline");
        expect(doc.querySelector("p")!.classList.contains("ql-indent-2")).toBe(false);
    });

    it("skips ql-indent-0 (zero — no padding added, class still removed)", () => {
        const doc = makeDoc(`<p class="ql-indent-0">text</p>`);
        normalizeStyleAndClassAttribute(doc, "inline");
        const p = doc.querySelector("p")!;
        expect(p.style.paddingLeft).toBe("");
        expect(p.classList.contains("ql-indent-0")).toBe(false);
    });

    it("preserves other classes on the element", () => {
        const doc = makeDoc(`<p class="ql-indent-1 some-other-class">text</p>`);
        normalizeStyleAndClassAttribute(doc, "inline");
        expect(doc.querySelector("p")!.classList.contains("some-other-class")).toBe(true);
    });

    it("converts multiple elements independently", () => {
        const doc = makeDoc(`
            <p class="ql-indent-1">a</p>
            <p class="ql-indent-3">b</p>
        `);
        normalizeStyleAndClassAttribute(doc, "inline");
        const [a, b] = Array.from(doc.querySelectorAll("p"));
        expect(a.style.paddingLeft).toBe("3em");
        expect(b.style.paddingLeft).toBe("9em");
    });

    it("leaves elements without ql-indent-* unchanged", () => {
        const doc = makeDoc(`<p class="some-class">text</p>`);
        normalizeStyleAndClassAttribute(doc, "inline");
        expect(doc.querySelector("p")!.style.paddingLeft).toBe("");
    });
});
