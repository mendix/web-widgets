import { ObjectItem } from "mendix";
import { DateLocalizer, Formats, ViewsProps } from "react-big-calendar";
import { CalendarContainerProps } from "../../typings/CalendarProps";
import { createConfigurableToolbar, CustomToolbar, ResolvedToolbarItem } from "../components/Toolbar";
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

        // Use custom caption for work_week if provided in toolbar items, else default to "Custom"
        const workWeekCaption = this.toolbarItems?.find(item => item.itemType === "work_week")?.caption || "Custom";

        return {
            components: {
                toolbar
            },
            defaultView: this.defaultView,
            messages: this.buildMessages(workWeekCaption),
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

    private buildMessages(workWeekCaption: string): {
        work_week: string;
        allDay?: string;
        date?: string;
        time?: string;
        event?: string;
    } {
        if (this.isCustomView && this.toolbarItems && this.toolbarItems.length > 0) {
            const byType = new Map(this.toolbarItems.map(i => [i.itemType, i]));
            const agenda = byType.get("agenda");
            return {
                work_week: workWeekCaption,
                ...(agenda?.customViewAllDayText ? { allDay: agenda.customViewAllDayText } : {}),
                ...(agenda?.customViewTextHeaderDate ? { date: agenda.customViewTextHeaderDate } : {}),
                ...(agenda?.customViewTextHeaderTime ? { time: agenda.customViewTextHeaderTime } : {}),
                ...(agenda?.customViewTextHeaderEvent ? { event: agenda.customViewTextHeaderEvent } : {})
            } as const;
        }
        return { work_week: workWeekCaption } as const;
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

        // Apply per-view custom formats only in custom view mode
        if (this.isCustomView && this.toolbarItems && this.toolbarItems.length > 0) {
            const byType = new Map(this.toolbarItems.map(i => [i.itemType, i]));

            type HeaderFormat = Formats["dayHeaderFormat"];
            const applyHeader = (pattern?: string, existing?: HeaderFormat): HeaderFormat | undefined => {
                if (!pattern) return existing;
                return (date: Date, _culture: string, loc: DateLocalizer) => loc.format(date, pattern);
            };

            const dayHeaderPattern = byType.get("day")?.customViewHeaderDayFormat || this.props.topBarDateFormat?.value;
            const weekHeaderPattern =
                byType.get("week")?.customViewHeaderDayFormat ||
                byType.get("work_week")?.customViewHeaderDayFormat ||
                this.props.topBarDateFormat?.value;
            const monthHeaderPattern =
                byType.get("month")?.customViewHeaderDayFormat || this.props.topBarDateFormat?.value;
            const agendaHeaderPattern =
                byType.get("agenda")?.customViewHeaderDayFormat || this.props.topBarDateFormat?.value;

            formats.dayHeaderFormat = applyHeader(dayHeaderPattern, formats.dayHeaderFormat);
            formats.dayRangeHeaderFormat = (
                range: { start: Date; end: Date },
                _culture: string,
                loc: DateLocalizer
            ) => {
                const pattern = weekHeaderPattern;
                if (pattern) {
                    return `${loc.format(range.start, pattern)} – ${loc.format(range.end, pattern)}`;
                }
                return `${loc.format(range.start, "P")} – ${loc.format(range.end, "P")}`;
            };
            formats.monthHeaderFormat = applyHeader(monthHeaderPattern, formats.monthHeaderFormat);
            formats.agendaHeaderFormat = (range: { start: Date; end: Date }, _culture: string, loc: DateLocalizer) => {
                const pattern = agendaHeaderPattern;
                if (pattern) {
                    return `${loc.format(range.start, pattern)} – ${loc.format(range.end, pattern)}`;
                }
                return `${loc.format(range.start, "P")} – ${loc.format(range.end, "P")}`;
            };

            // Month day numbers
            const monthCellDate = byType.get("month")?.customViewCellDateFormat;
            if (monthCellDate) {
                formats.dateFormat = (date: Date, _culture: string, loc: DateLocalizer) =>
                    loc.format(date, monthCellDate);
            }

            // Time gutters
            const weekTimeGutter = byType.get("week")?.customViewGutterTimeFormat;
            const dayTimeGutter = byType.get("day")?.customViewGutterTimeFormat;
            const workWeekTimeGutter = byType.get("work_week")?.customViewGutterTimeFormat;
            const chosenTimeGutter = weekTimeGutter || dayTimeGutter || workWeekTimeGutter;
            if (chosenTimeGutter) {
                formats.timeGutterFormat = (date: Date, _culture: string, loc: DateLocalizer) =>
                    loc.format(date, chosenTimeGutter);
            }
            const agendaTime = byType.get("agenda")?.customViewGutterTimeFormat;
            if (agendaTime) {
                formats.agendaTimeFormat = (date: Date, _culture: string, loc: DateLocalizer) =>
                    loc.format(date, agendaTime);
            }
            const agendaDate = byType.get("agenda")?.customViewGutterDateFormat;
            if (agendaDate) {
                formats.agendaDateFormat = (date: Date, _culture: string, loc: DateLocalizer) =>
                    loc.format(date, agendaDate);
            }
        }

        // Ensure showEventDate=false always hides event time ranges
        if (this.props.showEventDate?.value === false) {
            formats.eventTimeRangeFormat = () => "";
        }

        return formats;
    }

    private getSafeTimePattern(): string | undefined {
        if (this.props.timeFormat?.status === "available") {
            const trimmed = this.props.timeFormat.value?.trim();
            if (trimmed && trimmed.length > 0) {
                return trimmed;
            }
            return "p";
        }
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
            renderMode: i.renderMode,
            customButtonTooltip: i.buttonTooltip?.value,
            customButtonStyle: i.buttonStyle,
            customViewHeaderDayFormat: i.customViewHeaderDayFormat?.value,
            customViewCellDateFormat: i.customViewCellDateFormat?.value,
            customViewGutterTimeFormat: i.customViewGutterTimeFormat?.value,
            customViewGutterDateFormat: i.customViewGutterDateFormat?.value,
            customViewAllDayText: i.customViewAllDayText?.value,
            customViewTextHeaderDate: i.customViewTextHeaderDate?.value,
            customViewTextHeaderTime: i.customViewTextHeaderTime?.value,
            customViewTextHeaderEvent: i.customViewTextHeaderEvent?.value
        }));
    }
}
