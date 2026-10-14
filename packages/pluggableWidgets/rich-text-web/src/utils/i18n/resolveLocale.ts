/**
 * Resolve the widget's active display language from the page.
 *
 * Order: <html lang> → navigator.language → "en".
 * The result is normalized to a lowercase 2-letter language code; region and
 * script subtags are discarded (e.g. "de-DE" → "de", "pt_BR" → "pt").
 */
export function resolveLocale(): string {
    const htmlLang = typeof document !== "undefined" ? document.documentElement.lang : "";
    const navLang = typeof navigator !== "undefined" ? navigator.language : "";

    return normalizeLocale(htmlLang) || normalizeLocale(navLang) || "en";
}

/**
 * Normalize a raw locale string to a lowercase 2-letter code.
 * Returns "" when the input has no usable language subtag.
 */
export function normalizeLocale(raw: string | null | undefined): string {
    if (!raw) {
        return "";
    }
    // Split on "-" or "_" and take the primary language subtag.
    const primary = raw.trim().split(/[-_]/)[0].toLowerCase();
    // A language subtag is 2-3 letters; anything else is not a usable code.
    return /^[a-z]{2,3}$/.test(primary) ? primary.slice(0, 2) : "";
}
