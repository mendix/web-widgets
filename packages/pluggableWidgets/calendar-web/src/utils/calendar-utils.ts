import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { CalendarEvent } from "../helpers/CalendarPropsBuilder";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
    format,
    parse,
    startOfWeek,
    getDay,
    addDays,
    startOfMonth,
    endOfMonth,
    endOfWeek,
    addWeeks,
    differenceInCalendarDays
} from "date-fns";

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

export {
    format,
    parse,
    startOfWeek,
    getDay,
    addDays,
    startOfMonth,
    endOfMonth,
    endOfWeek,
    addWeeks,
    differenceInCalendarDays
};

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

export function getViewRange(view: string, date: Date): { start: Date; end: Date } {
    switch (view) {
        case "month":
            return { start: startOfMonth(date), end: endOfMonth(date) };
        case "week":
            return { start: startOfWeek(date), end: endOfWeek(date) };
        case "work_week": {
            const start = startOfWeek(date);
            return { start, end: addDays(start, 4) };
        }
        case "day":
            return { start: date, end: date };
        default:
            return { start: date, end: date };
    }
}

export const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales: {}
});
