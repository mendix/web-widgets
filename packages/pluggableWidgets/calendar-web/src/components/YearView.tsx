import { ReactElement, useMemo, useCallback } from "react";
import { CalendarProps, View } from "react-big-calendar";
import { MonthMiniGrid } from "./MonthMiniGrid";
import { getYear, getMonth, startOfYear, endOfYear, isAfter, isBefore } from "../utils/calendar-utils";
import { CalendarEvent } from "../utils/typings";

export function YearView(props: CalendarProps): ReactElement {
    const propsDate = props.date as Date | undefined;
    const propsEvents = props.events as CalendarEvent[] | undefined;
    const localizer = props.localizer;
    const onDrillDown = props.onDrillDown;
    // Injected by YearViewController.getComponent — the view to drill into on day-click,
    // already resolved against the calendar's enabled views. `undefined` disables drill-down.
    const dayClickView = (props as CalendarProps & { dayClickView?: string }).dayClickView;
    const interactive = Boolean(dayClickView);

    // Fall back to stable references (not `new Date()` / `[]` literals) so a missing
    // date/events prop doesn't produce a new value every render and invalidate the
    // eventsByMonth memo below on every re-render.
    const date = useMemo(() => propsDate ?? new Date(), [propsDate]);
    const events = useMemo(() => propsEvents ?? [], [propsEvents]);
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
            // Check if event overlaps with this year at all
            if (isAfter(event.end, yearStart) && isBefore(event.start, yearEnd)) {
                // Clamp the event's span to this year's bounds so events crossing a year
                // boundary (e.g. Dec 28 -> Jan 3) still get assigned to every month they
                // touch WITHIN this year, instead of relying on start/end year matching.
                const clampedStart = isBefore(event.start, yearStart) ? yearStart : event.start;
                const clampedEnd = isAfter(event.end, yearEnd) ? yearEnd : event.end;
                const startMonth = getMonth(clampedStart);
                const endMonth = getMonth(clampedEnd);

                for (let m = startMonth; m <= endMonth; m++) {
                    groups.get(m)?.push(event);
                }
            }
        });

        return groups;
    }, [events, date]);

    // Handle day click: drill into the configured target view for that date. Use RBC's
    // onDrillDown (not onNavigate+onView directly) so the target view is validated against
    // the calendar's enabled views before switching. `dayClickView` is already resolved to
    // an enabled view (or undefined) by CalendarPropsBuilder; when undefined, day-click is
    // disabled and cells render as non-interactive (see `interactive` below).
    const handleDayClick = useCallback(
        (clickedDate: Date) => {
            if (dayClickView) {
                onDrillDown?.(clickedDate, dayClickView as View);
            }
        },
        [onDrillDown, dayClickView]
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
                        onDayClick={interactive ? handleDayClick : undefined}
                        localizer={localizer}
                    />
                ))}
            </div>
        </div>
    );
}
