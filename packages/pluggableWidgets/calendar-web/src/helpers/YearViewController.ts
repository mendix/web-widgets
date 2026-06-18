import { createElement, ReactElement } from "react";
import { CalendarProps, NavigateAction } from "react-big-calendar";
import { addYears, endOfYear, getYear, startOfYear } from "../utils/calendar-utils";
import { YearView } from "../components/YearView";

type YearViewComponent = ((viewProps: CalendarProps) => ReactElement) & {
    navigate: (date: Date, action: NavigateAction) => Date;
    title: (date: Date, options: any) => string;
    range: (date: Date) => Date[];
};

export class YearViewController {
    static navigate(date: Date, action: NavigateAction): Date {
        switch (action) {
            case "PREV":
                return addYears(date, -1);
            case "NEXT":
                return addYears(date, 1);
            default:
                return date;
        }
    }

    static title(date: Date, _options?: any): string {
        return getYear(date).toString();
    }

    static range(date: Date): Date[] {
        return [startOfYear(date), endOfYear(date)];
    }

    static getComponent(): YearViewComponent {
        const Component = (viewProps: CalendarProps): ReactElement => {
            return createElement(YearView, viewProps);
        };

        Component.navigate = YearViewController.navigate;
        Component.title = YearViewController.title;
        Component.range = YearViewController.range;

        return Component;
    }
}
