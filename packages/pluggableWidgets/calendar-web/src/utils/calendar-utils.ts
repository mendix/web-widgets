import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { CalendarEvent } from "../helpers/CalendarPropsBuilder";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import * as dateFns from "date-fns";

export const DnDCalendar = withDragAndDrop(Calendar<CalendarEvent>);

type EventPropGetterReturnType = {
    style:
        | {
              backgroundColor: string;
          }
        | undefined;
};

export function eventPropGetter(event: CalendarEvent): EventPropGetterReturnType {
    return {
        style: event.color ? { backgroundColor: event.color } : undefined
    };
}

export function getRange(date: Date, visibleDays: Set<number>): Date[] {
    const startOfWeekDate = dateFns.startOfWeek(date, { weekStartsOn: 0 });

    return Array.from({ length: 7 }, (_, i) => dateFns.addDays(startOfWeekDate, i)).flatMap(current =>
        visibleDays.has(current.getDay()) ? [current] : []
    );
}

export function getViewRange(view: string, date: Date): { start: Date; end: Date } {
    switch (view) {
        case "month":
            return { start: dateFns.startOfMonth(date), end: dateFns.endOfMonth(date) };
        case "week":
            return { start: dateFns.startOfWeek(date), end: dateFns.endOfWeek(date) };
        case "work_week": {
            const start = dateFns.startOfWeek(date);
            return { start, end: dateFns.addDays(start, 4) };
        }
        case "day":
            return { start: date, end: date };
        default:
            return { start: date, end: date };
    }
}

export const localizer = dateFnsLocalizer({
    format: dateFns.format,
    parse: dateFns.parse,
    startOfWeek: dateFns.startOfWeek,
    getDay: dateFns.getDay,
    locales: {}
});
