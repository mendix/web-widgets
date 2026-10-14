import { createElement, ReactElement } from "react";
import { CalendarProps, NavigateAction } from "react-big-calendar";
import { YearView } from "../components/YearView";
import { addYears, endOfYear, getYear, startOfYear } from "../utils/calendar-utils";

type YearViewComponent = ((viewProps: CalendarProps) => ReactElement) & {
    navigate: (date: Date, action: NavigateAction) => Date;
    title: (date: Date, options: any) => string;
    range: (date: Date) => Date[];
};

function navigate(date: Date, action: NavigateAction): Date {
    switch (action) {
        case "PREV":
            return addYears(date, -1);
        case "NEXT":
            return addYears(date, 1);
        default:
            return date;
    }
}

function title(date: Date, _options?: any): string {
    return getYear(date).toString();
}

function range(date: Date): Date[] {
    return [startOfYear(date), endOfYear(date)];
}

// `dayClickView` is the view that a day-cell click should drill into. It is resolved
// by CalendarPropsBuilder against the enabled views; `undefined` means the target view
// is not enabled, so day-click is disabled and the cells render as non-interactive.
function getComponent(dayClickView?: string): YearViewComponent {
    const Component = (viewProps: CalendarProps): ReactElement => {
        return createElement(YearView, { ...viewProps, dayClickView } as CalendarProps);
    };

    Component.navigate = navigate;
    Component.title = title;
    Component.range = range;

    return Component;
}

// Namespace object grouping the react-big-calendar custom-view statics for the year view.
// Kept as a plain object (not a class) since it holds no instance state — matches eslint's
// no-extraneous-class rule while preserving the `YearViewController.getComponent(...)` API.
export const YearViewController = { navigate, title, range, getComponent };
