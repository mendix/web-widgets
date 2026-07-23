import de from "./locales/de.json";
import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import nl from "./locales/nl.json";

export type TranslationBundle = Record<string, string>;

/** Every key used by the widget is defined in the English base bundle. */
export type TranslationKey = keyof typeof en;

/** Bundled languages. `en` is the base; others may be partial (fall back to en). */
const BUNDLES: Record<string, TranslationBundle> = { en, nl, de, fr, es };

const EN_BASE: TranslationBundle = en;

/**
 * Return a complete bundle for the given locale: the locale's translations
 * shallow-merged over the English base, so any missing key falls back to
 * English. Unknown locales yield the English base.
 */
export function getBundle(locale: string): TranslationBundle {
    const bundle = BUNDLES[locale];
    if (!bundle || bundle === EN_BASE) {
        return EN_BASE;
    }
    return { ...EN_BASE, ...bundle };
}

/**
 * Look up a key in a resolved bundle. Substitutes `###` placeholders with the
 * provided values, in order. Falls back to the key itself if somehow missing
 * (should not happen, since the base defines every key).
 */
export function translate(bundle: TranslationBundle, key: string, ...substitutions: string[]): string {
    const template = bundle[key] ?? EN_BASE[key] ?? key;
    if (substitutions.length === 0) {
        return template;
    }
    const queue = [...substitutions];
    return template.replace(/###/g, () => queue.shift() ?? "");
}

export type TranslateFn = (key: TranslationKey | string, ...substitutions: string[]) => string;
