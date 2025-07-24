import { ObjectItem } from "mendix";
import { CalendarProps as ReactCalendarProps } from "react-big-calendar";
import { withDragAndDropProps } from "react-big-calendar/lib/addons/dragAndDrop";

export interface CalendarEvent {
    title: string;
    start: Date;
    end: Date;
    allDay: boolean;
    color?: string;
    item: ObjectItem;
}

export type EventDropOrResize = {
    event: CalendarEvent;
    start: Date;
    end: Date;
};

export interface DragAndDropCalendarProps<TEvent extends object = Event, TResource extends object = object>
    extends ReactCalendarProps<TEvent, TResource>,
        withDragAndDropProps<TEvent, TResource> {}
