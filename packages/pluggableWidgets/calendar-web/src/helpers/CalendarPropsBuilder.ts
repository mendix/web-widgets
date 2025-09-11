import { ObjectItem } from "mendix";
import { DateLocalizer, Formats, ViewsProps } from "react-big-calendar";
import { CalendarContainerProps } from "../../typings/CalendarProps";
import { CustomToolbar, ResolvedToolbarItem, createConfigurableToolbar } from "../components/Toolbar";
import { eventPropGetter, localizer } from "../utils/calendar-utils";
import { CalendarEvent, DragAndDropCalendarProps } from "../utils/typings";
import { CustomWeekController } from "./CustomWeekController";

export class CalendarPropsBuilder {
    private visibleDays: Set<number>;
    private defaultView: "month" | "week" | "work_week" | "day" | "agenda";
    private isCustomView: boolean;
    private events: CalendarEvent[];
    private minTime: Date;
    private maxTime: Date;
    private toolbarItems?: ResolvedToolbarItem[];

    constructor(private props: CalendarContainerProps) {
        this.isCustomView = props.view === "custom";
        this.defaultView = this.isCustomView ? props.defaultViewCustom : props.defaultViewStandard;
        this.visibleDays = this.buildVisibleDays();
        this.events = this.buildEvents(props.databaseDataSource?.items ?? []);
        this.minTime = this.buildTime(props.minHour ?? 0);
        this.maxTime = this.buildTime(props.maxHour ?? 24);
        this.toolbarItems = this.buildToolbarItems();
    }

    updateProps(props: CalendarContainerProps): void {
        // Update the props object, skipping props that are static (on construction only)
        this.props = props;
        this.events = this.buildEvents(props.databaseDataSource?.items ?? []);
        this.toolbarItems = this.buildToolbarItems();
    }

    build(): DragAndDropCalendarProps<CalendarEvent> {
        const formats = this.buildFormats();
        const views = this.buildVisibleViews();

        const toolbar =
            this.isCustomView && this.toolbarItems && this.toolbarItems.length > 0
                ? createConfigurableToolbar(this.toolbarItems)
                : CustomToolbar;

        return {
            components: {
                toolbar
            },
            defaultView: this.defaultView,
            messages: {
                work_week: "Custom"
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

        const timePattern = this.getSafeTimePattern();
        if (timePattern) {
            const formatWith = (date: Date, localizer: DateLocalizer, fallback = "p"): string => {
                try {
                    return localizer.format(date, timePattern);
                } catch (e) {
                    console.warn(
                        `[Calendar] Failed to format time using pattern "${timePattern}" – falling back to default pattern "${fallback}".`,
                        e
                    );
                    return localizer.format(date, fallback);
                }
            };

            formats.timeGutterFormat = (date: Date, _culture: string, loc: DateLocalizer) => formatWith(date, loc);
            formats.eventTimeRangeFormat = (
                { start, end }: { start: Date; end: Date },
                _culture: string,
                loc: DateLocalizer
            ) => `${formatWith(start, loc)} – ${formatWith(end, loc)}`;
            formats.agendaTimeRangeFormat = (
                { start, end }: { start: Date; end: Date },
                _culture: string,
                loc: DateLocalizer
            ) => `${formatWith(start, loc)} – ${formatWith(end, loc)}`;
        }

        // Ensure showEventDate=false always hides event time ranges
        if (this.props.showEventDate?.value === false) {
            formats.eventTimeRangeFormat = () => "";
        }

        const titlePattern = this.props.topBarDateFormat?.value?.trim();
        if (titlePattern) {
            formats.dayHeaderFormat = (date: Date, _culture: string, loc: DateLocalizer) =>
                loc.format(date, titlePattern);
            formats.monthHeaderFormat = (date: Date, _culture: string, loc: DateLocalizer) =>
                loc.format(date, titlePattern);
            formats.dayRangeHeaderFormat = (
                { start, end }: { start: Date; end: Date },
                _culture: string,
                loc: DateLocalizer
            ) => `${loc.format(start, titlePattern)} – ${loc.format(end, titlePattern)}`;
            formats.agendaHeaderFormat = (
                { start, end }: { start: Date; end: Date },
                _culture: string,
                loc: DateLocalizer
            ) => `${loc.format(start, titlePattern)} – ${loc.format(end, titlePattern)}`;
        }

        return formats;
    }

    private getSafeTimePattern(): string | undefined {
        console.log("this.props.timeFormat?.status", this.props.timeFormat?.status);
        if (this.props.timeFormat?.status === "available") {
            console.log("this.props.timeFormat.value", this.props.timeFormat.value);
            const trimmed = this.props.timeFormat.value?.trim();
            if (trimmed && trimmed.length > 0) {
                console.log("trimmed", trimmed);
                return trimmed;
            }
            console.log("returning p");
            return "p";
        }
        console.log("returning undefined");
        return undefined;
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
            // In custom view, visible views are now fully controlled by configured toolbar items.
            // We derive which views are enabled by inspecting toolbar items; if none provided, fall back to all.
            const itemViews = new Set(
                (this.toolbarItems ?? [])
                    .map(i => i.itemType)
                    .filter(t => ["day", "week", "work_week", "month", "agenda"].includes(t))
            );
            const hasAny = itemViews.size > 0;
            return {
                day: hasAny ? itemViews.has("day") : true,
                week: hasAny ? itemViews.has("week") : true,
                work_week:
                    hasAny && itemViews.has("work_week")
                        ? CustomWeekController.getComponent(this.visibleDays, this.props.topBarDateFormat?.value)
                        : false,
                month: hasAny ? itemViews.has("month") : true,
                agenda: hasAny ? itemViews.has("agenda") : false
            };
        } else {
            return { day: true, week: true, month: true };
        }
    }

    private buildToolbarItems(): ResolvedToolbarItem[] | undefined {
        const items = this.props.toolbarItems;
        if (!items || items.length === 0) {
            return undefined;
        }
        return items.map(i => ({
            itemType: i.itemType,
            position: i.position,
            caption: i.caption?.value,
            tooltip: i.tooltip?.value,
            renderMode: i.renderMode
        }));
    }
}
