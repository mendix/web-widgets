import classnames from "classnames";
import { ReactElement, createElement } from "react";
import { DnDCalendar, extractCalendarProps } from "./utils/calendar-utils";
import { CalendarContainerProps } from "../typings/CalendarProps";
import { constructWrapperStyle } from "./utils/style-utils";
import "./ui/Calendar.scss";

export default function MxCalendar(props: CalendarContainerProps): ReactElement {
    const { class: className } = props;
    const wrapperStyle = constructWrapperStyle(props);
    const calendarProps = extractCalendarProps(props);

    return (
        <div className={classnames("widget-calendar", className)} style={wrapperStyle}>
            <DnDCalendar {...calendarProps} />
        </div>
    );
}
