import { useMemo, createElement, ReactElement } from "react";
import classNames from "classnames";
import { CalendarContainerProps } from "../typings/CalendarProps";
import { CalendarPropsBuilder } from "./helpers/CalendarPropsBuilder";
import { DnDCalendar } from "./utils/calendar-utils";
import { constructWrapperStyle } from "./utils/style-utils";
import "./ui/Calendar.scss";

export default function MxCalendar(props: CalendarContainerProps): ReactElement {
    const wrapperStyle = useMemo(() => constructWrapperStyle(props), [props]);
    const calendarProps = useMemo(() => new CalendarPropsBuilder(props).build(), [props]);
    return (
        <div className={classNames("widget-calendar", props.class)} style={wrapperStyle}>
            <DnDCalendar {...calendarProps} />
        </div>
    );
}
