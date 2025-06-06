import * as dateFns from "date-fns";
import { Calendar, dateFnsLocalizer, ViewsProps } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { CalendarContainerProps } from "../../typings/CalendarProps";
import { CustomToolbar } from "../components/Toolbar";

import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Define the event shape
export interface CalEvent {
    title: string;
    start: Date;
    end: Date;
    allDay: boolean;
    color?: string;
}

// Configure date-fns localizer
const localizer = dateFnsLocalizer({
    format: dateFns.format,
    parse: dateFns.parse,
    startOfWeek: dateFns.startOfWeek,
    getDay: dateFns.getDay,
    locales: {}
});

export const DnDCalendar = withDragAndDrop(Calendar);

function getViewRange(view: string, date: Date) {
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

export function eventPropGetter(event: CalEvent) {
    return {
        style: event.color ? { backgroundColor: event.color } : undefined
    };
}

export function extractCalendarProps(props: CalendarContainerProps) {
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
        return { title, start, end, allDay, color };
    });

    const viewsOption: ViewsProps<CalEvent, object> =
        props.view === "standard" ? ["day", "week", "month"] : ["month", "week", "work_week", "day", "agenda"];

    const handleSelectEvent = (event: CalEvent) => {
        if (props.onClickEvent?.canExecute) {
            props.onClickEvent.execute({
                startDate: event.start,
                endDate: event.end,
                allDay: event.allDay,
                title: event.title
            });
        }
    };

    const handleSelectSlot = (slotInfo: { start: Date; end: Date; action: string }) => {
        if (props.enableCreate && props.onCreateEvent?.canExecute) {
            props.onCreateEvent.execute({
                startDate: slotInfo.start,
                endDate: slotInfo.end,
                allDay: slotInfo.action === "select"
            });
        }
    };

    const handleEventDropOrResize = ({ event, start, end }: { event: CalEvent; start: Date; end: Date }) => {
        if (props.onChange?.canExecute) {
            props.onChange.execute({
                oldStart: event.start,
                oldEnd: event.end,
                newStart: start,
                newEnd: end
            });
        }
    };

    const handleRangeChange = (date: Date, view: string) => {
        if (props.onRangeChange?.canExecute) {
            const { start, end } = getViewRange(view, date);
            props.onRangeChange.execute({
                rangeStart: start,
                rangeEnd: end,
                currentView: view
            });
        }
    };

    return {
        components: {
            toolbar: CustomToolbar
        },
        defaultView: props.defaultView,
        events,
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
        titleAccessor: (event: CalEvent) => event.title
    };
}
