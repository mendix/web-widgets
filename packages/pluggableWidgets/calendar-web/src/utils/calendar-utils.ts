import * as dateFns from "date-fns";
import { ObjectItem } from "mendix";
import { Calendar, CalendarProps, dateFnsLocalizer, NavigateAction, ViewsProps } from "react-big-calendar";
import withDragAndDrop, { withDragAndDropProps } from "react-big-calendar/lib/addons/dragAndDrop";
import { CalendarContainerProps } from "../../typings/CalendarProps";
import { CustomToolbar } from "../components/Toolbar";
import { createElement, ReactElement } from "react";
// @ts-expect-error - TimeGrid is not part of public typings
import TimeGrid from "react-big-calendar/lib/TimeGrid";

import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";

export interface CalEvent {
    title: string;
    start: Date;
    end: Date;
    allDay: boolean;
    color?: string;
    item: ObjectItem;
}

// Configure date-fns localizer
const localizer = dateFnsLocalizer({
    format: dateFns.format,
    parse: dateFns.parse,
    startOfWeek: dateFns.startOfWeek,
    getDay: dateFns.getDay,
    locales: {}
});

export const DnDCalendar = withDragAndDrop(Calendar<CalEvent, object>);

function getViewRange(view: string, date: Date): { start: Date; end: Date } {
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

type EventPropGetterReturnType = {
    style:
        | {
              backgroundColor: string;
          }
        | undefined;
};

export function eventPropGetter(event: CalEvent): EventPropGetterReturnType {
    return {
        style: event.color ? { backgroundColor: event.color } : undefined
    };
}

interface DragAndDropCalendarProps<TEvent extends object = Event, TResource extends object = object>
    extends CalendarProps<TEvent, TResource>,
        withDragAndDropProps<TEvent, TResource> {}

export function extractCalendarProps(props: CalendarContainerProps): DragAndDropCalendarProps<CalEvent, object> {
    const visibleSet = new Set<number>();
    // Caption for custom work week button / title

    const customCaption: string = props.customViewCaption ?? "Custom";
    const dayProps = [
        { prop: props.showSunday, day: 0 },
        { prop: props.showMonday, day: 1 },
        { prop: props.showTuesday, day: 2 },
        { prop: props.showWednesday, day: 3 },
        { prop: props.showThursday, day: 4 },
        { prop: props.showFriday, day: 5 },
        { prop: props.showSaturday, day: 6 }
    ];

    dayProps.forEach(({ prop, day }) => {
        if (prop) visibleSet.add(day);
    });

    function customRange(date: Date): Date[] {
        const startOfWeekDate = dateFns.startOfWeek(date, { weekStartsOn: 0 });
        const range: Date[] = [];
        for (let i = 0; i < 7; i++) {
            const current = dateFns.addDays(startOfWeekDate, i);
            if (visibleSet.has(current.getDay())) {
                range.push(current);
            }
        }
        return range;
    }

    // Custom work-week view component based on TimeGrid
    const CustomWeek = (viewProps: CalendarProps): ReactElement => {
        const { date } = viewProps;
        const range = customRange(date as Date);

        return createElement(TimeGrid as any, { ...viewProps, range, eventOffset: 15 });
    };

    CustomWeek.range = customRange;
    CustomWeek.navigate = (date: Date, action: NavigateAction): Date => {
        switch (action) {
            case "PREV":
                return dateFns.addWeeks(date, -1);
            case "NEXT":
                return dateFns.addWeeks(date, 1);
            default:
                return date;
        }
    };

    CustomWeek.title = (date: Date, options: any): string => {
        const loc = options?.localizer ?? {
            // Fallback localizer (EN)
            format: (d: Date, _fmt: string) => d.toLocaleDateString(undefined, { month: "short", day: "2-digit" })
        };

        const range = customRange(date);

        // Determine if the dates are contiguous (difference of 1 day between successive dates)
        const isContiguous = range.every(
            (curr, idx, arr) => idx === 0 || dateFns.differenceInCalendarDays(curr, arr[idx - 1]) === 1
        );

        if (isContiguous) {
            // Keep default first–last representation (e.g. "Mar 11 – Mar 15")
            const first = range[0];
            const last = range[range.length - 1];
            return `${loc.format(first, "MMM dd")} – ${loc.format(last, "MMM dd")}`;
        }

        // Non-contiguous selection → list individual weekday names (Mon, Wed, Fri)
        const weekdayList = range.map(d => loc.format(d, "EEE")).join(", ");

        return weekdayList;
    };

    const items = props.databaseDataSource?.items ?? [];
    const events: CalEvent[] = items.map(item => {
        const title =
            props.titleType === "attribute" && props.titleAttribute
                ? (props.titleAttribute.get(item).value ?? "")
                : props.titleType === "expression" && props.titleExpression
                  ? String(props.titleExpression.get(item) ?? "")
                  : "Untitled Event";
        const start = props.startAttribute?.get(item).value ?? new Date();
        const end = props.endAttribute?.get(item).value ?? start;
        const allDay = props.allDayAttribute?.get(item).value ?? false;
        const color = props.eventColor?.get(item).value;
        return { title, start, end, allDay, color, item };
    });

    // Update button label inside localizer messages
    (localizer as any).messages = {
        ...localizer.messages,
        work_week: customCaption
    };

    const viewsOption: ViewsProps<CalEvent, object> =
        props.view === "standard"
            ? { day: true, week: true, month: true }
            : { day: true, week: true, month: true, work_week: CustomWeek, agenda: true };

    // Compute minimum and maximum times for the day based on configured hours
    const minTime = new Date();
    minTime.setHours(props.minHour ?? 0, 0, 0, 0);
    const maxTime = new Date();
    maxTime.setHours(props.maxHour ?? 24, 0, 0, 0);

    const handleSelectEvent = (event: CalEvent): void => {
        if (props.onClickEvent?.get(event.item).canExecute) {
            props.onClickEvent.get(event.item).execute({
                startDate: event.start,
                endDate: event.end,
                allDay: event.allDay,
                title: event.title
            });
        }
    };

    const handleSelectSlot = (slotInfo: { start: Date; end: Date; action: string }): void => {
        if (props.enableCreate && props.onCreateEvent?.canExecute) {
            props.onCreateEvent.execute({
                startDate: slotInfo.start,
                endDate: slotInfo.end,
                allDay: slotInfo.action === "select"
            });
        }
    };

    const handleEventDropOrResize = ({ event, start, end }: { event: CalEvent; start: Date; end: Date }): void => {
        if (props.onChange?.get(event.item).canExecute) {
            props.onChange.get(event.item).execute({
                oldStart: event.start,
                oldEnd: event.end,
                newStart: start,
                newEnd: end
            });
        }
    };

    const handleRangeChange = (date: Date, view: string, _action: NavigateAction): void => {
        if (props.onRangeChange?.canExecute) {
            const { start, end } = getViewRange(view, date);
            props.onRangeChange.execute({
                rangeStart: start,
                rangeEnd: end,
                currentView: view
            });
        }
    };

    const formats = props.showEventDate ? {} : { eventTimeRangeFormat: () => "" };

    return {
        components: {
            toolbar: CustomToolbar
        },
        defaultView: props.defaultView,
        messages: {
            work_week: customCaption
        },
        events,
        formats,
        localizer,
        resizable: props.editable !== "never",
        selectable: props.enableCreate,
        views: viewsOption,
        allDayAccessor: (event: CalEvent) => event.allDay,
        endAccessor: (event: CalEvent) => event.end,
        eventPropGetter,
        onEventDrop: handleEventDropOrResize,
        onEventResize: handleEventDropOrResize,
        onNavigate: handleRangeChange,
        onSelectEvent: handleSelectEvent,
        onSelectSlot: handleSelectSlot,
        startAccessor: (event: CalEvent) => event.start,
        titleAccessor: (event: CalEvent) => event.title,
        showAllEvents: props.showAllEvents,
        min: minTime,
        max: maxTime
    };
}
