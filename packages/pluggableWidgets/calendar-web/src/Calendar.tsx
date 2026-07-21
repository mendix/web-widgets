import { Fragment, ReactElement, useCallback, useMemo, useState } from "react";
import classNames from "classnames";
import { View } from "react-big-calendar";
import { CalendarContainerProps } from "../typings/CalendarProps";
import { CalendarPropsBuilder } from "./helpers/CalendarPropsBuilder";
import { DnDCalendar } from "./utils/calendar-utils";
import { constructWrapperStyle } from "./utils/style-utils";
import "./ui/Calendar.scss";
import { useCalendarEvents } from "./helpers/useCalendarEvents";
import { useLocalizer } from "./helpers/useLocalizer";

export default function MxCalendar(props: CalendarContainerProps): ReactElement {
    // useMemo with empty dependency array is used
    // because style and calendar controller needs to be created only once
    // and not on every re-render
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const wrapperStyle = useMemo(() => constructWrapperStyle(props), []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const calendarController = useMemo(() => new CalendarPropsBuilder(props), []);

    // Get locale-aware localizer
    const { localizer, culture } = useLocalizer();

    // The calendar is controlled on `view` so the props builder always knows which view is on
    // screen — needed to resolve the shared RBC `dayFormat` key (week/work_week/day column
    // headers) to that view's own custom pattern instead of a sibling view's. Undefined until
    // RBC reports its first view (via defaultView), at which point the builder picks a safe one.
    const [activeView, setActiveView] = useState<View | undefined>(undefined);
    const handleView = useCallback((view: View) => setActiveView(view), []);

    const calendarProps = useMemo(() => {
        calendarController.updateProps(props);
        return calendarController.build(localizer, culture, activeView);
    }, [props, calendarController, localizer, culture, activeView]);

    const calendarEvents = useCalendarEvents(props);

    return (
        <Fragment>
            {props.startDateAttribute?.status === "loading" ? (
                <progress className="widget-calendar-loading-bar" />
            ) : (
                <div className={classNames("widget-calendar", props.class)} style={wrapperStyle}>
                    <DnDCalendar {...calendarProps} {...calendarEvents} onView={handleView} />
                </div>
            )}
        </Fragment>
    );
}
