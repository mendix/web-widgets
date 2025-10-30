// TypeScript interfaces for Mendix global objects

export interface MXLocalePatterns {
    date: string;
    datetime: string;
    time: string;
}

export interface MXLocaleDates {
    weekdays: string[];
    shortWeekdays: string[];
    months: string[];
    shortMonths: string[];
    abbreviatedMonths: string[];
    abbreviatedShortMonths: string[];
    dayPeriods: string[];
    eras: string[];
}

export interface MXLocaleNumbers {
    decimalSeparator: string;
    groupingSeparator: string;
    minusSign: string;
}

export interface MXSessionLocale {
    code: string;
    languageTag: string;
    firstDayOfWeek: number;
    dates: MXLocaleDates;
    patterns: MXLocalePatterns;
    numbers: MXLocaleNumbers;
}

export interface MXSessionData {
    locale: MXSessionLocale;
}

export interface MXSession {
    sessionData: MXSessionData;
}

export interface MXGlobalObject {
    mx?: {
        session?: MXSession;
    };
}

declare global {
    interface Window extends MXGlobalObject {}
}
