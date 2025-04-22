import classnames from "classnames";
import * as dateFns from "date-fns";
import { ReactElement, createElement } from "react";
import { Calendar, dateFnsLocalizer, ViewsProps } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { CalendarContainerProps } from "../typings/CalendarProps";
import { constructWrapperStyle } from "./utils/utils";

const localizer = dateFnsLocalizer({
    format: dateFns.format,
    parse: dateFns.parse,
    startOfWeek: dateFns.startOfWeek,
    getDay: dateFns.getDay,
    locales: {}
});

interface CalEvent {
    title: string;
    start: Date;
    end: Date;
    allDay: boolean;
    color?: string;
}

export default function MxCalendar(props: CalendarContainerProps): ReactElement {
    const { class: className } = props;
    const wrapperStyle = constructWrapperStyle(props);

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
        props.view === "standard" ? ["month", "week", "day"] : ["month", "week", "work_week", "day", "agenda"];

    const eventPropGetter = (event: CalEvent) => ({
        style: event.color ? { backgroundColor: event.color } : undefined
    });

    return (
        <div className={classnames("widget-calendar", className)} style={wrapperStyle}>
            <Calendar<CalEvent>
                localizer={localizer}
                events={events}
                defaultView={props.defaultView}
                startAccessor={event => event.start}
                endAccessor={event => event.end}
                views={viewsOption}
                titleAccessor={event => event.title}
                allDayAccessor={event => event.allDay}
                eventPropGetter={eventPropGetter}
            />
        </div>
    );
}
