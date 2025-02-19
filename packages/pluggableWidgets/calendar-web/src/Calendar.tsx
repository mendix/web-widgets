import classnames from "classnames";
import { CSSProperties, ReactElement, createElement } from "react";
import { CalendarContainerProps } from "../typings/CalendarProps";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import * as dateFns from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = dateFnsLocalizer({
    format: dateFns.format,
    parse: dateFns.parse,
    startOfWeek: dateFns.startOfWeek,
    getDay: dateFns.getDay,
    locales: {}
});

function getHeightScale(height: number, heightUnit: "pixels" | "percentageOfParent" | "percentageOfView"): string {
    return `${height}${heightUnit === "pixels" ? "px" : heightUnit === "percentageOfView" ? "vh" : "%"}`;
}

export function constructWrapperStyle(props: CalendarContainerProps): CSSProperties {
    const { widthUnit, heightUnit, minHeightUnit, maxHeightUnit, width, height, minHeight, maxHeight, OverflowY } =
        props;

    const wrapperStyle: Pick<CSSProperties, "width" | "height" | "minHeight" | "maxHeight" | "maxWidth" | "overflowY"> =
        {};

    wrapperStyle.width = `${width}${widthUnit === "pixels" ? "px" : "%"}`;
    if (heightUnit === "percentageOfWidth") {
        wrapperStyle.height = "auto";

        if (minHeightUnit !== "none") {
            wrapperStyle.minHeight = getHeightScale(minHeight, minHeightUnit);
        }

        if (maxHeightUnit !== "none") {
            wrapperStyle.maxHeight = getHeightScale(maxHeight, maxHeightUnit);
            wrapperStyle.overflowY = OverflowY;
        }
    } else {
        wrapperStyle.height = getHeightScale(height, heightUnit);
    }

    return wrapperStyle;
}

export default function MxCalendar(props: CalendarContainerProps): ReactElement {
    const { class: className } = props;
    const wrapperStyle = constructWrapperStyle(props);
    console.log("wrapperStyle", wrapperStyle);
    return (
        <div className={classnames("widget-calendar", className)} style={wrapperStyle}>
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
                views={["month", "day", "week", "work_week", "month", "agenda"]}
            />
        </div>
    );
}
