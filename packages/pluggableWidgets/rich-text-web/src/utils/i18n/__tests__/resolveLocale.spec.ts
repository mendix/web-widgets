import { normalizeLocale, resolveLocale } from "../resolveLocale";

describe("normalizeLocale", () => {
    it("lowercases and strips region/script subtags", () => {
        expect(normalizeLocale("de-DE")).toBe("de");
        expect(normalizeLocale("pt_BR")).toBe("pt");
        expect(normalizeLocale("EN")).toBe("en");
        expect(normalizeLocale("nl")).toBe("nl");
    });

    it("returns empty string for missing or non-language input", () => {
        expect(normalizeLocale("")).toBe("");
        expect(normalizeLocale(null)).toBe("");
        expect(normalizeLocale(undefined)).toBe("");
        expect(normalizeLocale("123")).toBe("");
    });
});

describe("resolveLocale", () => {
    const originalLang = document.documentElement.lang;

    afterEach(() => {
        document.documentElement.lang = originalLang;
        jest.restoreAllMocks();
    });

    it("uses the page <html lang> when set", () => {
        document.documentElement.lang = "de-DE";
        expect(resolveLocale()).toBe("de");
    });

    it("falls back to navigator.language when <html lang> is empty", () => {
        document.documentElement.lang = "";
        jest.spyOn(navigator, "language", "get").mockReturnValue("fr-FR");
        expect(resolveLocale()).toBe("fr");
    });

    it("falls back to English when no signal is usable", () => {
        document.documentElement.lang = "";
        jest.spyOn(navigator, "language", "get").mockReturnValue("");
        expect(resolveLocale()).toBe("en");
    });
});
