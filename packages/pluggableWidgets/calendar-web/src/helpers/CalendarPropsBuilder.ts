import { ObjectItem } from "mendix";
import { DateLocalizer, Formats, ViewsProps } from "react-big-calendar";
import { CalendarContainerProps } from "../../typings/CalendarProps";
import { CustomToolbar } from "../components/Toolbar";
import { eventPropGetter, localizer } from "../utils/calendar-utils";
import { CalendarEvent, DragAndDropCalendarProps } from "../utils/typings";
import { CustomWeekController } from "./CustomWeekController";

export class CalendarPropsBuilder {
    private visibleDays: Set<number>;
    private defaultView: "month" | "week" | "work_week" | "day" | "agenda";
    private customCaption: string;
    private isCustomView: boolean;
    private events: CalendarEvent[];
    private minTime: Date;
    private maxTime: Date;

    constructor(private props: CalendarContainerProps) {
        this.isCustomView = props.view === "custom";
        this.defaultView = this.isCustomView ? props.defaultViewCustom : props.defaultViewStandard;
        this.customCaption = props.customViewCaption?.value ?? "Custom";
        this.visibleDays = this.buildVisibleDays();
        this.events = this.buildEvents(props.databaseDataSource?.items ?? []);
        this.minTime = this.buildTime(props.minHour ?? 0);
        this.maxTime = this.buildTime(props.maxHour ?? 24);
    }

    updateProps(props: CalendarContainerProps): void {
        // Update the props object, skipping props that are static (on construction only)
        this.props = props;
        this.customCaption = props.customViewCaption?.value ?? "Custom";
        this.events = this.buildEvents(props.databaseDataSource?.items ?? []);
    }

    build(): DragAndDropCalendarProps<CalendarEvent> {
        const formats = this.buildFormats();
        const views = this.buildVisibleViews();

        return {
            components: {
                toolbar: CustomToolbar
            },
            defaultView: this.defaultView,
            messages: {
                work_week: this.customCaption
            },
            events: this.events,
            formats,
            localizer,
            resizable: this.props.editable.value ?? true,
            selectable: this.props.editable.value ?? true,
            views,
            allDayAccessor: (event: CalendarEvent) => event.allDay,
            endAccessor: (event: CalendarEvent) => event.end,
            eventPropGetter,
            // @ts-expect-error – navigatable prop not yet in typings but exists in runtime component
            navigatable: true,
            startAccessor: (event: CalendarEvent) => event.start,
            titleAccessor: (event: CalendarEvent) => event.title,
            showAllEvents: this.props.showAllEvents,
            min: this.minTime,
            max: this.maxTime
        };
    }

    private buildEvents(items: ObjectItem[]): CalendarEvent[] {
        return items.map(item => {
            return this.buildEventItem(item);
        });
    }

    private buildEventItem(item: ObjectItem): CalendarEvent {
        const title = this.buildEventTitle(item);
        const start = this.props.startAttribute?.get(item).value ?? new Date();
        const end = this.props.endAttribute?.get(item).value ?? start;
        const allDay = this.props.allDayAttribute?.get(item).value ?? false;
        const color = this.props.eventColor?.get(item).value;

        return { title, start, end, allDay, color, item };
    }

    private buildEventTitle(item: ObjectItem): string {
        if (this.props.titleType === "attribute" && this.props.titleAttribute) {
            return this.props.titleAttribute.get(item).value ?? "";
        } else if (this.props.titleType === "expression" && this.props.titleExpression) {
            return String(this.props.titleExpression.get(item) ?? "");
        } else {
            return "Untitled Event";
        }
    }

    private buildFormats(): Formats {
        const formats: Formats = {};

        if (this.props.showEventDate?.value === false) {
            formats.eventTimeRangeFormat = () => "";
        }

        if (this.props.timeFormat?.status === "available") {
            const timeFormat = this.props.timeFormat.value?.trim() || "p";

            const timeFormatFn = (date: Date, _culture: string, localizer: DateLocalizer): string => {
                try {
                    return localizer.format(date, timeFormat);
                } catch (e) {
                    console.warn(
                        `[Calendar] Failed to format time using pattern "${timeFormat}" – falling back to default pattern "p".`,
                        e
                    );
                    return localizer.format(date, "p");
                }
            };

            const rangeFormatFn = (
                { start, end }: { start: Date; end: Date },
                _culture: string,
                localizer: DateLocalizer
            ): string => {
                try {
                    return `${localizer.format(start, timeFormat)} - ${localizer.format(end, timeFormat)}`;
                } catch (e) {
                    console.warn(
                        `[Calendar] Failed to format time range using pattern "${timeFormat}" – falling back to default pattern "p".`,
                        e
                    );
                    return `${localizer.format(start, "p")} - ${localizer.format(end, "p")}`;
                }
            };

            formats.timeGutterFormat = timeFormatFn;
            formats.agendaTimeFormat = timeFormatFn;
            formats.agendaTimeRangeFormat = rangeFormatFn;
            formats.eventTimeRangeFormat = rangeFormatFn;
        }

        return formats;
    }

    private buildTime(hour: number): Date {
        const time = new Date();
        time.setMinutes(0, 0, 0);

        if (hour >= 24) {
            time.setHours(23, 59, 59);
        } else {
            time.setHours(hour);
        }

        return time;
    }

    private buildVisibleDays(): Set<number> {
        const visibleDays = [
            this.props.customViewShowSunday,
            this.props.customViewShowMonday,
            this.props.customViewShowTuesday,
            this.props.customViewShowWednesday,
            this.props.customViewShowThursday,
            this.props.customViewShowFriday,
            this.props.customViewShowSaturday
        ].flatMap((isVisible, dayIndex) => (isVisible ? [dayIndex] : []));

        return new Set(visibleDays);
    }

    private buildVisibleViews(): ViewsProps<CalendarEvent> {
        if (this.isCustomView) {
            const {
                customViewShowDay,
                customViewShowWeek,
                customViewShowMonth,
                customViewShowAgenda,
                customViewShowCustomWeek
            } = this.props;
            return {
                day: customViewShowDay,
                week: customViewShowWeek,
                work_week: customViewShowCustomWeek ? CustomWeekController.getComponent(this.visibleDays) : false,
                month: customViewShowMonth,
                agenda: customViewShowAgenda
            };
        } else {
            return { day: true, week: true, month: true };
        }
    }
}
