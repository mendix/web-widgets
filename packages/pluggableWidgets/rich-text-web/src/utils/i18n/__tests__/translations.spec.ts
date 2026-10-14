import { getBundle, translate } from "../translations";

describe("getBundle", () => {
    it("returns a localized bundle merged over the English base", () => {
        const de = getBundle("de");
        expect(de["toolbar.bold"]).toBe("Fett");
        // A key present in the base is always available.
        expect(de["toolbar.undo"]).toBe("Rückgängig");
    });

    it("returns the English base for an unknown locale", () => {
        const bundle = getBundle("xx");
        expect(bundle["toolbar.bold"]).toBe("Bold");
    });
});

describe("translate", () => {
    it("returns the active-bundle string", () => {
        const nl = getBundle("nl");
        expect(translate(nl, "toolbar.bold")).toBe("Vet");
    });

    it("falls back to English for a key missing from the active bundle", () => {
        // Build a deliberately partial bundle to exercise the fallback path.
        const partial = { "toolbar.bold": "X" } as Record<string, string>;
        expect(translate(partial, "toolbar.italic")).toBe("Italic");
    });

    it("echoes the key when it exists in neither the bundle nor the base", () => {
        expect(translate({}, "font.arial")).toBe("font.arial");
    });

    it("substitutes ### placeholders in order", () => {
        const en = getBundle("en");
        expect(translate(en, "statusBar.words", "42")).toBe("Words: 42");
    });
});
