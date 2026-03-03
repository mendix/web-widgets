import { createElement, ReactElement } from "react";
import { CalendarProps, NavigateAction } from "react-big-calendar";
// @ts-expect-error - TimeGrid is not part of public typings
import TimeGrid from "react-big-calendar/lib/TimeGrid";
import { addWeeks, differenceInCalendarDays, getRange } from "../utils/calendar-utils";

type CustomWeekComponent = ((viewProps: CalendarProps) => ReactElement) & {
    navigate: (date: Date, action: NavigateAction) => Date;
    title: (date: Date, options: any) => string;
    range: (date: Date, options?: { localizer?: any }) => Date[];
};

export class CustomWeekController {
    constructor(
        private date: Date,
        private viewProps: CalendarProps,
        private visibleDays: Set<number>
    ) {}

    render(): ReactElement {
        const range = this.customRange();
        return createElement(TimeGrid as any, {
            ...this.viewProps,
            range,
            eventOffset: 15
        });
    }

    private customRange(): Date[] {
        return getRange(this.date, this.visibleDays);
    }

    static navigate(date: Date, action: NavigateAction): Date {
        switch (action) {
            case "PREV":
                return addWeeks(date, -1);
            case "NEXT":
                return addWeeks(date, 1);
            default:
                return date;
        }
    }

    static title(date: Date, options: any, visibleDays: Set<number>, titlePattern?: string): string {
        const range = getRange(date, visibleDays);

        const loc = options?.localizer ?? {
            format: (d: Date, _fmt: string) => d.toLocaleDateString(undefined, { month: "short", day: "2-digit" })
        };

        const isContiguous = range.every(
            (curr, idx, arr) => idx === 0 || differenceInCalendarDays(curr, arr[idx - 1]) === 1
        );

        if (isContiguous) {
            const first = range[0];
            const last = range[range.length - 1];
            if (titlePattern) {
                return `${loc.format(first, titlePattern)} – ${loc.format(last, titlePattern)}`;
            }
            return `${loc.format(first, "MMM dd")} – ${loc.format(last, "MMM dd")}`;
        }

        if (titlePattern) {
            return range.map(d => loc.format(d, titlePattern)).join(", ");
        }
        return range.map(d => loc.format(d, "EEE")).join(", ");
    }

    // Main factory method that injects visibleDays
    static getComponent(visibleDays: Set<number>, titlePattern?: string): CustomWeekComponent {
        const Component = (viewProps: CalendarProps): ReactElement => {
            const controller = new CustomWeekController(viewProps.date as Date, viewProps, visibleDays);
            return controller.render();
        };

        Component.navigate = CustomWeekController.navigate;
        Component.title = (date: Date, options: any): string =>
            CustomWeekController.title(date, options, visibleDays, titlePattern);
        Component.range = (date: Date): Date[] => getRange(date, visibleDays);

        return Component;
    }
}
