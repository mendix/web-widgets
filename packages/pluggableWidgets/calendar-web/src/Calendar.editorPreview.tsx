import classnames from "classnames";
import * as dateFns from "date-fns";
import { ReactElement, createElement } from "react";
import { Calendar, dateFnsLocalizer, EventPropGetter } from "react-big-calendar";
import { CalendarPreviewProps } from "../typings/CalendarProps";
import { CustomToolbar } from "./components/Toolbar";
import { constructWrapperStyle, WrapperStyleProps } from "./utils/style-utils";
import { eventPropGetter } from "./utils/calendar-utils";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "./ui/Calendar.scss";

const localizer = dateFnsLocalizer({
    format: dateFns.format,
    parse: dateFns.parse,
    startOfWeek: dateFns.startOfWeek,
    getDay: dateFns.getDay,
    locales: {}
});

const events = [
    {
        title: "Leave",
        allDay: true,
        start: new Date(new Date().setDate(new Date().getDate() - 15)),
        end: new Date(new Date().setDate(new Date().getDate() - 7)),
        guid: "",
        color: ""
    },
    {
        title: "Leave",
        allDay: true,
        start: new Date(new Date().setDate(new Date().getDate() - 9)),
        end: new Date(new Date().setDate(new Date().getDate() - 5)),
        guid: "",
        color: "green"
    },
    {
        title: "BD",
        allDay: true,
        start: new Date(),
        end: new Date(),
        guid: "",
        color: "red"
    },
    {
        title: "Bank Holiday",
        allDay: true,
        start: new Date(new Date().valueOf() + 6000 * 3600 * 24),
        end: new Date(new Date().valueOf() + 9000 * 3600 * 24),
        guid: "",
        color: "grey"
    },
    {
        title: "Bank Holiday",
        allDay: true,
        start: new Date(new Date().valueOf() + 4000 * 3600 * 24),
        end: new Date(new Date().valueOf() + 8000 * 3600 * 24),
        guid: "",
        color: "purple"
    },
    {
        title: "Leave",
        allDay: true,
        start: new Date(new Date().valueOf() + 10000 * 3600 * 24),
        end: new Date(new Date().valueOf() + 14000 * 3600 * 24),
        guid: "",
        color: ""
    }
];

export function preview(props: CalendarPreviewProps): ReactElement {
    const { class: className } = props;
    const wrapperStyle = constructWrapperStyle(props as WrapperStyleProps);

    // Cast eventPropGetter to satisfy preview Calendar generic
    const previewEventPropGetter = eventPropGetter as unknown as EventPropGetter<(typeof events)[0]>;

    return (
        <div className={classnames("widget-events-preview", "widget-calendar", className)} style={wrapperStyle}>
            <Calendar
                components={{ toolbar: CustomToolbar }}
                defaultView={props.defaultViewStandard}
                events={events}
                localizer={localizer}
                messages={{ ...localizer.messages, work_week: "Custom" }}
                views={["day", "week", "month", "work_week"]}
                eventPropGetter={previewEventPropGetter}
            />
        </div>
    );
}
