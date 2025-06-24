import classnames from "classnames";
import { ReactElement, createElement } from "react";
import { CalendarContainerProps } from "../typings/CalendarProps";
import { CalendarPropsBuilder } from "./helpers/CalendarPropsBuilder";
import { DnDCalendar } from "./utils/calendar-utils";
import { constructWrapperStyle } from "./utils/style-utils";
import "./ui/Calendar.scss";

export default function MxCalendar(props: CalendarContainerProps): ReactElement {
    const { class: className } = props;
    const wrapperStyle = constructWrapperStyle(props);
    const calendarProps = new CalendarPropsBuilder(props).build();

    return (
        <div className={classnames("widget-calendar", className)} style={wrapperStyle}>
            <DnDCalendar {...calendarProps} />
        </div>
    );
}
