import { ObjectItem } from "mendix";
import {
    CalendarProps as ReactCalendarProps,
    DateLocalizer,
    Formats,
    NavigateAction,
    ViewsProps
} from "react-big-calendar";
import { withDragAndDropProps } from "react-big-calendar/lib/addons/dragAndDrop";

import { CalendarContainerProps } from "../../typings/CalendarProps";
import { CustomToolbar } from "../components/Toolbar";
import { eventPropGetter, getViewRange, localizer } from "../utils/calendar-utils";
import { CustomWeekController } from "./CustomWeekController";

export interface CalendarEvent {
    title: string;
    start: Date;
    end: Date;
    allDay: boolean;
    color?: string;
    item: ObjectItem;
}

type EventDropOrResize = {
    event: CalendarEvent;
    start: Date;
    end: Date;
};

interface DragAndDropCalendarProps<TEvent extends object = Event, TResource extends object = object>
    extends ReactCalendarProps<TEvent, TResource>,
        withDragAndDropProps<TEvent, TResource> {}

export class CalendarPropsBuilder {
    private readonly visibleDays: Set<number>;
    private readonly defaultView: "month" | "week" | "work_week" | "day" | "agenda";
    private readonly customCaption: string;
    private readonly isCustomView: boolean;
    private readonly events: CalendarEvent[];
    private readonly minTime: Date;
    private readonly maxTime: Date;

    constructor(private props: CalendarContainerProps) {
        this.isCustomView = props.view === "custom";
        this.defaultView = this.isCustomView ? props.defaultViewCustom : props.defaultViewStandard;
        this.customCaption = props.customViewCaption?.value ?? "Custom";
        this.visibleDays = this.buildVisibleDays();
        this.events = this.buildEvents(props.databaseDataSource?.items ?? []);
        this.minTime = this.buildTime(props.minHour ?? 0);
        this.maxTime = this.buildTime(props.maxHour ?? 24);
    }

    build(): DragAndDropCalendarProps<CalendarEvent> {
        const CustomWeek = CustomWeekController.getComponent(this.visibleDays);
        const formats = this.buildFormats();
        const views: ViewsProps<CalendarEvent> = this.isCustomView
            ? { day: true, week: true, month: true, work_week: CustomWeek, agenda: true }
            : { day: true, week: true, month: true };

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
            resizable: this.props.editable !== "never",
            selectable: this.props.enableCreate,
            views,
            allDayAccessor: (event: CalendarEvent) => event.allDay,
            endAccessor: (event: CalendarEvent) => event.end,
            eventPropGetter,
            onEventDrop: this.handleEventDropOrResize,
            onEventResize: this.handleEventDropOrResize,
            onNavigate: this.handleRangeChange,
            onSelectEvent: this.handleEditEvent,
            onSelectSlot: this.handleCreateEvent,
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

        if (this.props.showEventDate === false) {
            formats.eventTimeRangeFormat = () => "";
        }

        if (this.props.timeFormat?.status === "available") {
            const timeFormat = this.props.timeFormat.value?.trim() || "p";

            formats.timeGutterFormat = (date: Date, _culture: string, localizer: DateLocalizer) => {
                // Some versions of date-fns (used internally by react-big-calendar) throw
                // when the supplied format string does not contain any long-format tokens
                // ("P" or "p"). This try/catch ensures that we gracefully fall back to a
                // locale-aware default ("p") instead of crashing the whole widget.
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
            this.props.showSunday,
            this.props.showMonday,
            this.props.showTuesday,
            this.props.showWednesday,
            this.props.showThursday,
            this.props.showFriday,
            this.props.showSaturday
        ].flatMap((isVisible, dayIndex) => (isVisible ? [dayIndex] : []));

        return new Set(visibleDays);
    }

    private handleEventDropOrResize = ({ event, start, end }: EventDropOrResize): void => {
        const action = this.props.onDragDropResize?.get(event.item);

        if (action?.canExecute) {
            action.execute({
                oldStart: event.start,
                oldEnd: event.end,
                newStart: start,
                newEnd: end
            });
        }
    };

    private handleRangeChange = (date: Date, view: string, _action: NavigateAction): void => {
        const action = this.props.onViewRangeChange;

        if (action?.canExecute) {
            const { start, end } = getViewRange(view, date);
            action.execute({
                rangeStart: start,
                rangeEnd: end,
                currentView: view
            });
        }
    };

    private handleEditEvent = (event: CalendarEvent): void => {
        const action = this.props.onEditEvent?.get(event.item);

        if (action?.canExecute) {
            action.execute();
        }
    };

    private handleCreateEvent = (slotInfo: { start: Date; end: Date; action: string }): void => {
        const action = this.props.onCreateEvent;

        if (action?.canExecute && this.props.enableCreate) {
            action?.execute({
                startDate: slotInfo.start,
                endDate: slotInfo.end,
                allDay: slotInfo.action === "select"
            });
        }
    };
}
