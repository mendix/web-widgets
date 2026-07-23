import { createContext, ReactElement, ReactNode, useContext, useMemo } from "react";
import { resolveLocale } from "./resolveLocale";
import { getBundle, translate, TranslateFn } from "./translations";

const TranslationContext = createContext<TranslateFn | undefined>(undefined);

/**
 * Provides the translation function `t` to the widget subtree. The locale is
 * resolved once from the page language (see resolveLocale) and the matching
 * bundle is merged over the English base.
 */
export function TranslationProvider({ children }: { children: ReactNode }): ReactElement {
    const t = useMemo<TranslateFn>(() => {
        const bundle = getBundle(resolveLocale());
        return (key, ...substitutions) => translate(bundle, key as string, ...substitutions);
    }, []);

    return <TranslationContext.Provider value={t}>{children}</TranslationContext.Provider>;
}

/**
 * Returns the translation function. When no provider is mounted (e.g. isolated
 * tests or design-time preview), falls back to the English base bundle so text
 * is never missing or broken.
 */
export function useT(): TranslateFn {
    const t = useContext(TranslationContext);
    if (t) {
        return t;
    }
    const enBundle = getBundle("en");
    return (key, ...substitutions) => translate(enBundle, key as string, ...substitutions);
}
