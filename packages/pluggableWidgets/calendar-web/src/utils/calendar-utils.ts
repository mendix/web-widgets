import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { CalendarEvent } from "./typings";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { addDays, addWeeks, differenceInCalendarDays, format, getDay, parse, startOfWeek } from "date-fns";
import type { MXLocaleDates, MXLocaleNumbers, MXLocalePatterns, MXSessionData } from "../../typings/global";

// Utility to lighten hex colors. Accepts #RGB or #RRGGBB.
function lightenColor(color: string, amount = 0.2): string {
    if (color.startsWith("#")) {
        let hex = color.slice(1);
        if (hex.length === 3) {
            hex = hex
                .split("")
                .map(c => c + c)
                .join("");
        }
        if (hex.length === 6) {
            /* eslint-disable no-bitwise */
            const num = parseInt(hex, 16);
            const r = Math.min(255, Math.round(((num >> 16) & 0xff) * (1 + amount)));
            const g = Math.min(255, Math.round(((num >> 8) & 0xff) * (1 + amount)));
            const b = Math.min(255, Math.round((num & 0xff) * (1 + amount)));
            return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
            /* eslint-enable no-bitwise */
        }
    }
    // Fallback: return same color
    return color;
}

export { format, parse, startOfWeek, getDay, addDays, addWeeks, differenceInCalendarDays };

export const DnDCalendar = withDragAndDrop(Calendar<CalendarEvent>);

type EventPropGetterReturnType = {
    style:
        | {
              backgroundColor: string;
          }
        | undefined;
};

export function eventPropGetter(
    event: CalendarEvent,
    _start?: Date,
    _end?: Date,
    isSelected?: boolean
): EventPropGetterReturnType {
    if (!event.color) {
        // Let RBC handle default styling
        return { style: undefined };
    }

    const backgroundColor = isSelected ? lightenColor(event.color, 0.25) : event.color;

    return {
        style: { backgroundColor }
    };
}

export function getRange(date: Date, visibleDays: Set<number>): Date[] {
    const startOfWeekDate = startOfWeek(date, { weekStartsOn: 0 });

    return Array.from({ length: 7 }, (_, i) => addDays(startOfWeekDate, i)).flatMap(current =>
        visibleDays.has(current.getDay()) ? [current] : []
    );
}

/**
 * Converts empty or whitespace-only strings to undefined.
 * Useful for handling optional textTemplate values from Mendix.
 * @param value - The string value to check
 * @returns The trimmed value if non-empty, otherwise undefined
 */
export function getTextValue(value?: string): string | undefined {
    return value && value.trim().length > 0 ? value : undefined;
}

// Helper to get Mendix session locale
export interface MendixLocaleData {
    code: string;
    languageTag: string;
    firstDayOfWeek: number;
    dates?: MXLocaleDates;
    patterns?: MXLocalePatterns;
    numbers?: MXLocaleNumbers;
}

export function getMendixLocale(): MendixLocaleData | null {
    try {
        const sessionData: MXSessionData | undefined = window.mx?.session?.sessionData;
        if (sessionData?.locale) {
            return {
                code: sessionData.locale.code || "en-US",
                languageTag: sessionData.locale.languageTag || sessionData.locale.code || "en-US",
                firstDayOfWeek: sessionData.locale.firstDayOfWeek ?? 0,
                dates: sessionData.locale.dates,
                patterns: sessionData.locale.patterns,
                numbers: sessionData.locale.numbers
            };
        }
    } catch (e) {
        console.warn("[Calendar] Failed to get Mendix locale:", e);
    }
    return null;
}

export const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales: {} // Will be populated dynamically
});
