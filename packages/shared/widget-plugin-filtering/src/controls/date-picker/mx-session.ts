export interface MXLocalePatterns {
    date: string;
    datetime: string;
    time: string;
}

export interface MXSessionLocale {
    code: string;
    firstDayOfWeek: number;
    languageTag: string;
    patterns: MXLocalePatterns;
}

interface MXGlobalObject {
    session: { getConfig(): { locale: MXSessionLocale } };
}

/** Reads `window.mx` without declaring it globally, so widgets can keep their own declaration. */
export function mxGlobal(): MXGlobalObject | undefined {
    return (window as { mx?: MXGlobalObject }).mx;
}
