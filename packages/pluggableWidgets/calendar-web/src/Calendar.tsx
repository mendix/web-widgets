import { useMemo, createElement, ReactElement } from "react";
import classNames from "classnames";
import { CalendarContainerProps } from "../typings/CalendarProps";
import { CalendarPropsBuilder } from "./helpers/CalendarPropsBuilder";
import { DnDCalendar } from "./utils/calendar-utils";
import { constructWrapperStyle } from "./utils/style-utils";
import "./ui/Calendar.scss";
import { useCalendarEvents } from "./helpers/useCalendarEvents";

export default function MxCalendar(props: CalendarContainerProps): ReactElement {
    // useMemo with empty dependency array is used
    // because style and calendar controller needs to be created only once
    // and not on every re-render
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const wrapperStyle = useMemo(() => constructWrapperStyle(props), []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const calendarController = useMemo(() => new CalendarPropsBuilder(props), []);
    const calendarProps = useMemo(() => {
        calendarController.updateProps(props);
        return calendarController.build();
    }, [props, calendarController]);

    const calendarEvents = useCalendarEvents(props);
    return (
        <div className={classNames("widget-calendar", props.class)} style={wrapperStyle}>
            <DnDCalendar {...calendarProps} {...calendarEvents} />
        </div>
    );
}
