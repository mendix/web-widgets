import { ReactElement } from "react";
import {
    startOfMonth,
    getDaysInMonth,
    getDay,
    addMonths,
    isSameDay,
    startOfDay,
    endOfDay,
    isAfter,
    isBefore
} from "../utils/calendar-utils";
import { CalendarEvent } from "../utils/typings";

interface MonthMiniGridProps {
    year: number;
    month: number; // 0-11
    events: CalendarEvent[];
    onDayClick: (date: Date) => void;
    localizer: any;
}

// Helper to check if an event occurs on a specific day
function eventOccursOnDay(dayDate: Date, event: CalendarEvent): boolean {
    const dayStart = startOfDay(dayDate);
    const dayEnd = endOfDay(dayDate);

    let eventStart = event.start;
    let eventEnd = event.end;

    // Normalize all-day events to day boundaries
    if (event.allDay) {
        eventStart = startOfDay(eventStart);
        eventEnd = endOfDay(eventEnd);
    }

    // Check overlap: event.end > day.start AND event.start < day.end
    return isAfter(eventEnd, dayStart) && isBefore(eventStart, dayEnd);
}

export function MonthMiniGrid({ year, month, events, onDayClick, localizer }: MonthMiniGridProps): ReactElement {
    const today = new Date();

    // Get month info
    const monthStart = startOfMonth(new Date(year, month, 1));
    const daysInMonth = getDaysInMonth(monthStart);
    const firstDayOfWeek = getDay(monthStart); // 0 = Sunday, 6 = Saturday

    // Get localized month name
    const monthName = localizer.format(monthStart, "MMM", undefined);

    // Weekday headers (Su Mo Tu We Th Fr Sa)
    const weekdayHeaders = [0, 1, 2, 3, 4, 5, 6].map(dayIndex => {
        // Format a date with that day of week to get localized short name
        const sampleDate = new Date(2023, 0, dayIndex + 1); // Jan 1, 2023 was Sunday
        return localizer.format(sampleDate, "EEEEEE", undefined); // "Su", "Mo", etc.
    });

    // Build day cells array
    const dayCells: Array<{
        date: Date;
        dayNumber: number;
        isCurrentMonth: boolean;
        isToday: boolean;
        hasEvents: boolean;
        eventCount: number;
    }> = [];

    // Leading days from previous month
    const prevMonth = addMonths(monthStart, -1);
    const daysInPrevMonth = getDaysInMonth(prevMonth);
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const dayNumber = daysInPrevMonth - i;
        const date = new Date(year, month - 1, dayNumber);
        const eventsOnDay = events.filter(event => eventOccursOnDay(date, event));
        dayCells.push({
            date,
            dayNumber,
            isCurrentMonth: false,
            isToday: false,
            hasEvents: eventsOnDay.length > 0,
            eventCount: eventsOnDay.length
        });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const eventsOnDay = events.filter(event => eventOccursOnDay(date, event));
        dayCells.push({
            date,
            dayNumber: day,
            isCurrentMonth: true,
            isToday: isSameDay(date, today),
            hasEvents: eventsOnDay.length > 0,
            eventCount: eventsOnDay.length
        });
    }

    // Trailing days from next month
    const totalCellsSoFar = dayCells.length;
    const cellsNeeded = Math.ceil(totalCellsSoFar / 7) * 7; // Round up to complete weeks
    const trailingDays = cellsNeeded - totalCellsSoFar;
    for (let day = 1; day <= trailingDays; day++) {
        const date = new Date(year, month + 1, day);
        const eventsOnDay = events.filter(event => eventOccursOnDay(date, event));
        dayCells.push({
            date,
            dayNumber: day,
            isCurrentMonth: false,
            isToday: false,
            hasEvents: eventsOnDay.length > 0,
            eventCount: eventsOnDay.length
        });
    }

    return (
        <div className="year-month-card">
            <h3 className="year-month-header">{monthName}</h3>
            <div className="year-month-content">
                {/* Weekday headers */}
                <div className="year-weekday-headers">
                    {weekdayHeaders.map((dayName, index) => (
                        <div key={index} className="year-weekday-header">
                            {dayName}
                        </div>
                    ))}
                </div>

                {/* Day cells */}
                <div className="year-days-grid">
                    {dayCells.map((cell, index) => {
                        const cellClasses = [
                            "year-day-cell",
                            cell.isCurrentMonth ? "year-day-cell-current-month" : "year-day-cell-other-month",
                            cell.isToday ? "year-day-cell-today" : "",
                            cell.hasEvents ? "year-day-cell-has-event" : ""
                        ]
                            .filter(Boolean)
                            .join(" ");

                        const ariaLabel = `${monthName} ${cell.dayNumber}, ${year}, ${
                            cell.eventCount === 0
                                ? "no events"
                                : cell.eventCount === 1
                                  ? "1 event"
                                  : `${cell.eventCount} events`
                        }`;

                        return (
                            <div
                                key={index}
                                className={cellClasses}
                                onClick={() => onDayClick(cell.date)}
                                onKeyDown={e => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        onDayClick(cell.date);
                                    }
                                }}
                                tabIndex={0}
                                role="button"
                                aria-label={ariaLabel}
                            >
                                <span className="year-day-number">{cell.dayNumber}</span>
                                {cell.hasEvents && <span className="year-event-dot" />}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
