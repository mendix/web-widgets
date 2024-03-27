/**
 * Change the time of a date and return an UTC date
 * @param date
 * @param hours
 * @param minutes
 * @param seconds
 */
export function changeTimeToMidnight(date: Date): Date {
    const newDate = new Date(date.getTime());
    newDate.setHours(0);
    newDate.setMinutes(0);
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);
    return newDate;
}

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
