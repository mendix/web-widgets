import { INDENT_MAGIC_NUMBER, isSafeCssColor, normalizeStyleAndClassAttribute } from "../utils/helpers";

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

describe("isSafeCssColor", () => {
    // jsdom does not implement CSS.supports, so these exercise the regex allowlist fallback.
    describe("fallback allowlist (no CSS.supports)", () => {
        it("accepts hex colors", () => {
            expect(isSafeCssColor("#fff")).toBe(true);
            expect(isSafeCssColor("#ffffff")).toBe(true);
            expect(isSafeCssColor("#abcd")).toBe(true);
            expect(isSafeCssColor("#11223344")).toBe(true);
        });

        it("accepts rgb/rgba colors", () => {
            expect(isSafeCssColor("rgb(1, 2, 3)")).toBe(true);
            expect(isSafeCssColor("rgba(1, 2, 3, 0.5)")).toBe(true);
        });

        it("accepts hsl/hsla colors", () => {
            expect(isSafeCssColor("hsl(120, 50%, 50%)")).toBe(true);
            expect(isSafeCssColor("hsla(120, 50%, 50%, 0.5)")).toBe(true);
        });

        it("trims surrounding whitespace before validating", () => {
            expect(isSafeCssColor("  #fff  ")).toBe(true);
        });

        it("rejects empty or whitespace-only values", () => {
            expect(isSafeCssColor("")).toBe(false);
            expect(isSafeCssColor("   ")).toBe(false);
        });

        it("rejects CSS selector breakout payloads", () => {
            expect(isSafeCssColor("red} body{display:none")).toBe(false);
            expect(isSafeCssColor("#fff; background: url(evil)")).toBe(false);
        });

        it("rejects url() and expression() smuggling", () => {
            expect(isSafeCssColor('url("javascript:alert(1)")')).toBe(false);
            expect(isSafeCssColor("expression(alert(1))")).toBe(false);
        });

        it("rejects named colors when CSS.supports is unavailable", () => {
            // Falls to the allowlist, which intentionally does not enumerate named colors.
            expect(isSafeCssColor("red")).toBe(false);
        });
    });

    describe("with CSS.supports available", () => {
        const originalCSS = (global as any).CSS;
        afterEach(() => {
            (global as any).CSS = originalCSS;
        });

        it("delegates valid colors to CSS.supports", () => {
            (global as any).CSS = { supports: jest.fn().mockReturnValue(true) };
            expect(isSafeCssColor("red")).toBe(true);
            expect((global as any).CSS.supports).toHaveBeenCalledWith("color", "red");
        });

        it("still rejects breakout payloads before reaching CSS.supports", () => {
            const supports = jest.fn().mockReturnValue(true);
            (global as any).CSS = { supports };
            expect(isSafeCssColor("red} body{display:none")).toBe(false);
            expect(supports).not.toHaveBeenCalled();
        });

        it("rejects values CSS.supports deems invalid", () => {
            (global as any).CSS = { supports: jest.fn().mockReturnValue(false) };
            expect(isSafeCssColor("notacolor")).toBe(false);
        });
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
