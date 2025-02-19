import classNames from "classnames";
import { ReactElement, createElement } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import * as dateFns from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { CalendarPreviewProps } from "typings/CalendarProps";

const localizer = dateFnsLocalizer({
    format: dateFns.format,
    parse: dateFns.parse,
    startOfWeek: dateFns.startOfWeek,
    getDay: dateFns.getDay,
    locales: {}
});

export function preview(_props: CalendarPreviewProps): ReactElement {
    return (
        <div className={classNames("widget-events-preview")} style={{ minHeight: "250px" }}>
            <Calendar
                localizer={localizer}
                events={[
                    {
                        title: "My event",
                        start: new Date(),
                        end: new Date()
                    }
                ]}
                startAccessor="start"
                endAccessor="end"
            />
        </div>
    );
}
