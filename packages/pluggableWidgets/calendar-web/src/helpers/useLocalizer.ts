import { useMemo } from "react";
import { dateFnsLocalizer, DateLocalizer } from "react-big-calendar";
import { format, FormatLong, getDay, Locale, Localize, Match, parse, startOfWeek } from "date-fns";
import { getMendixLocale } from "../utils/calendar-utils";

/**
 * Creates a minimal date-fns compatible Locale object from Mendix locale data.
 * This allows us to use Mendix's localized weekday/month names directly without
 * importing external date-fns locale files.
 */
function createLocaleFromMendixData(mendixLocale: ReturnType<typeof getMendixLocale>): Locale {
    if (!mendixLocale?.dates) {
        // Return a minimal default locale structure
        return {
            code: "en-US",
            localize: {} as Localize,
            formatLong: {} as FormatLong,
            formatDistance: () => "",
            formatRelative: () => "",
            match: {} as Match,
            options: {
                weekStartsOn: 0,
                firstWeekContainsDate: 1
            }
        };
    }

    const { dates, firstDayOfWeek, languageTag } = mendixLocale;

    // Create a minimal locale object that date-fns can use
    // We provide localize.month and localize.day functions with support for different widths
    // (wide, abbreviated, narrow) since RBC uses these for displaying month/weekday names
    const locale: Locale = {
        code: languageTag?.replace("_", "-") || "en-US",
        localize: {
            month: (monthIndex: number, options?: { width?: "wide" | "abbreviated" | "narrow" }) => {
                const width = options?.width || "wide";
                if (width === "abbreviated") {
                    return dates.abbreviatedMonths?.[monthIndex] || dates.months?.[monthIndex] || "";
                }
                return dates.months?.[monthIndex] || "";
            },
            day: (dayIndex: number, options?: { width?: "wide" | "abbreviated" | "short" | "narrow" }) => {
                const width = options?.width || "wide";
                if (width === "abbreviated" || width === "short") {
                    return dates.shortWeekdays?.[dayIndex] || dates.weekdays?.[dayIndex] || "";
                }
                return dates.weekdays?.[dayIndex] || "";
            },
            // Minimal implementations for other required methods
            ordinalNumber: (n: number) => String(n),
            era: () => "",
            quarter: () => "",
            dayPeriod: (dayPeriodEnumValue: string) => {
                if (dayPeriodEnumValue === "am") return dates.dayPeriods?.[0] || "AM";
                if (dayPeriodEnumValue === "pm") return dates.dayPeriods?.[1] || "PM";
                return dayPeriodEnumValue;
            }
        } as Localize,
        formatLong: {
            date: () => "P",
            time: () => "p",
            dateTime: () => "Pp"
        } as FormatLong,
        formatDistance: () => "",
        formatRelative: () => "",
        match: {} as Match,
        options: {
            weekStartsOn: firstDayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6,
            firstWeekContainsDate: 1
        }
    };

    return locale;
}

/**
 * Creates a locale-aware localizer that updates reactively when Mendix locale changes.
 * Uses Mendix's locale data directly to avoid external locale imports.
 */
export function useLocalizer(): { localizer: DateLocalizer; culture: string } {
    const mendixLocale = getMendixLocale();
    const culture = mendixLocale?.languageTag?.replace("_", "-") || "en-US";
    const firstDayOfWeek = mendixLocale?.firstDayOfWeek ?? 0;

    const localizer = useMemo(() => {
        // Create a custom locale object from Mendix data
        const customLocale = createLocaleFromMendixData(mendixLocale);

        const locales: { [key: string]: Locale } = {
            [culture]: customLocale
        };

        return dateFnsLocalizer({
            format,
            parse,
            startOfWeek: (date: Date) => {
                // Use Mendix's firstDayOfWeek setting
                return startOfWeek(date, { weekStartsOn: firstDayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6 });
            },
            getDay,
            locales
        });
    }, [culture, firstDayOfWeek, mendixLocale]);

    return {
        localizer,
        culture
    };
}
