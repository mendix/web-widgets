import { ReactElement, useMemo } from "react";
import classNames from "classnames";
import { CalendarContainerProps } from "../typings/CalendarProps";
import { CalendarPropsBuilder } from "./helpers/CalendarPropsBuilder";
import { DnDCalendar } from "./utils/calendar-utils";
import { constructWrapperStyle } from "./utils/style-utils";
import "./ui/Calendar.scss";
import { useCalendarEvents } from "./helpers/useCalendarEvents";

export default function MxCalendar(props: CalendarContainerProps): ReactElement {
    const wrapperStyle = useMemo(() => constructWrapperStyle(props), []);
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
