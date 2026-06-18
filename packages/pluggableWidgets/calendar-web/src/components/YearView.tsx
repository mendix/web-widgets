import { ReactElement, useMemo, useCallback } from "react";
import { CalendarProps } from "react-big-calendar";
import {
    getYear,
    getMonth,
    startOfYear,
    endOfYear,
    isAfter,
    isBefore,
    differenceInCalendarDays
} from "../utils/calendar-utils";
import { CalendarEvent } from "../utils/typings";
import { MonthMiniGrid } from "./MonthMiniGrid";
import "../ui/YearView.scss";

export function YearView(props: CalendarProps): ReactElement {
    const date = (props.date as Date) || new Date();
    const events = (props.events as CalendarEvent[]) || [];
    const localizer = props.localizer;
    const onNavigate = props.onNavigate;
    const onView = props.onView;
    const year = getYear(date);

    // Group events by month (0-11)
    const eventsByMonth = useMemo(() => {
        const groups = new Map<number, CalendarEvent[]>();

        // Initialize 12 months
        for (let m = 0; m < 12; m++) {
            groups.set(m, []);
        }

        // Filter events to current year and group by month
        const yearStart = startOfYear(date);
        const yearEnd = endOfYear(date);

        events.forEach(event => {
            // Check if event overlaps with this year
            if (isAfter(event.end, yearStart) && isBefore(event.start, yearEnd)) {
                const eventStartMonth = getMonth(event.start);
                const eventEndMonth = getMonth(event.end);
                const eventStartYear = getYear(event.start);
                const eventEndYear = getYear(event.end);

                // Add event to starting month if it's in this year
                if (eventStartYear === year) {
                    groups.get(eventStartMonth)?.push(event);
                }

                // Handle multi-month events
                if (differenceInCalendarDays(event.end, event.start) > 0 && eventEndYear === year) {
                    for (let m = eventStartMonth + 1; m <= Math.min(eventEndMonth, 11); m++) {
                        if (groups.get(m) && !groups.get(m)?.includes(event)) {
                            groups.get(m)?.push(event);
                        }
                    }
                }
            }
        });

        return groups;
    }, [events, year, date]);

    // Handle day click: navigate to that date and switch to day view
    const handleDayClick = useCallback(
        (clickedDate: Date) => {
            if (onNavigate) {
                onNavigate(clickedDate, "day", "DATE");
            }
            if (onView) {
                onView("day");
            }
        },
        [onNavigate, onView]
    );

    return (
        <div className="widget-calendar-year-view">
            <div className="year-grid">
                {Array.from({ length: 12 }, (_, monthIndex) => (
                    <MonthMiniGrid
                        key={monthIndex}
                        year={year}
                        month={monthIndex}
                        events={eventsByMonth.get(monthIndex) || []}
                        onDayClick={handleDayClick}
                        localizer={localizer}
                    />
                ))}
            </div>
        </div>
    );
}
