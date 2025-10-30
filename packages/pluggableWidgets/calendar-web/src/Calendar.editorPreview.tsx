import classnames from "classnames";
import { ReactElement } from "react";
import { Calendar, dateFnsLocalizer, EventPropGetter, View } from "react-big-calendar";
import { CalendarPreviewProps } from "../typings/CalendarProps";
import { createConfigurableToolbar, CustomToolbar } from "./components/Toolbar";
import { eventPropGetter, format, getDay, parse, startOfWeek } from "./utils/calendar-utils";
import { constructWrapperStyle, WrapperStyleProps } from "./utils/style-utils";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "./ui/Calendar.scss";

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
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

    const isCustomView = props.view === "custom";
    const toolbar =
        isCustomView && props.toolbarItems?.length
            ? createConfigurableToolbar(
                  props.toolbarItems.map(i => ({
                      itemType: i.itemType,
                      position: i.position,
                      caption: i.caption,
                      renderMode: i.renderMode,
                      customButtonTooltip: undefined,
                      customButtonStyle: i.buttonStyle
                  })) as any
              )
            : CustomToolbar;

    const defaultView = isCustomView ? props.defaultViewCustom : props.defaultViewStandard;
    const views: View[] = isCustomView
        ? (["day", "week", "month", "work_week"] as View[])
        : (["day", "week", "month"] as View[]);

    return (
        <div className={classnames("widget-events-preview", "widget-calendar", className)} style={wrapperStyle}>
            <Calendar
                components={{ toolbar }}
                defaultView={defaultView}
                events={events}
                localizer={localizer}
                messages={{ ...localizer.messages, work_week: "Custom" }}
                views={views}
                eventPropGetter={previewEventPropGetter}
            />
        </div>
    );
}
