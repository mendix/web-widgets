import * as locales from "date-fns/locale";
import { registerLocale } from "react-datepicker";
import { MXSessionLocale } from "../../typings/global";

/**
 * This function takes format string and replace
 * single "d" and "M" with their "double" equivalent
 * Main purpose is to "fix" value formats accepted
 * by DateFilter input. Idea is that if format string is
 * uses short format (e.g d-M-yyyy) user should still
 * be able to type value with leading zeros "09-02-2002".
 *
 * Example:
 * "d/M/yyyy" -> "dd/MM/yyyy"
 *
 * @param formatString
 */
export function doubleMonthOrDayWhenSingle(formatString: string): string {
    return formatString.replaceAll(/d+|M+/g, m => (m.length > 1 ? m : m + m));
}

/**
 * Given a date formatter string replaces all uppercase 'E' to the lowercase 'e'
 * this function returns the same string with the above characters replaced.
 * Example: "YYww.E" returns "YYww.e"
 * @function dayOfWeekWhenUpperCase
 * @param {string} formatString The string used to find cases of uppercase E.
 * @return {string} The same string but with 'E' in lowercase ('e').
 *
 */
export function dayOfWeekWhenUpperCase(formatString: string): string {
    return formatString.replaceAll(/E/g, m => m.toLowerCase());
}

/**
 * Map current app date format to date picker date format(s).
 * @returns {string|string[]}
 */
export function pickerDateFormat(locale: MXSessionLocale): string | string[] {
    const {
        patterns: { date: appDateFormat }
    } = locale;
    let dateFormat: string | string[];
    // Replace with full patterns d -> dd, M -> MM
    dateFormat = doubleMonthOrDayWhenSingle(appDateFormat);
    // Replace Date format E to follow unicode standard (e...eeee)
    dateFormat = dayOfWeekWhenUpperCase(dateFormat);
    // Use multiple formats if formats are not equal
    return dateFormat === appDateFormat ? dateFormat : [dateFormat, appDateFormat];
}

interface DateFilterLocale {
    [key: string]: locales.Locale;
}

/**
 * Reg current locale in datepicker config.
 * Later this locale can be passed to datepicker as locale prop.
 * @returns {string} registered locale.
 */
export function setupLocales(locale: MXSessionLocale): string {
    const { languageTag = "en-US" } = locale;

    const [language] = languageTag.split("-");
    const languageTagWithoutDash = languageTag.replace("-", "");

    if (languageTagWithoutDash in locales) {
        registerLocale(language, (locales as DateFilterLocale)[languageTagWithoutDash]);
    } else if (language in locales) {
        registerLocale(language, (locales as DateFilterLocale)[language]);
    }

    return language;
}

export function getLocale(): MXSessionLocale {
    return window.mx
        ? window.mx.session.getConfig().locale
        : {
              languageTag: "en-US",
              code: "en_US",
              firstDayOfWeek: 0,
              patterns: {
                  date: "M/d/yyyy",
                  datetime: "M/d/yyyy, h:mm a",
                  time: "h:mm a"
              }
          };
}
