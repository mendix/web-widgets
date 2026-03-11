import { useCallback, useEffect, useRef, useState } from "react";
import { CalendarEvent, EventDropOrResize } from "../utils/typings";
import { CalendarContainerProps } from "../../typings/CalendarProps";
import { CalendarProps, NavigateAction, View } from "react-big-calendar";

type CalendarEventHandlers = Pick<
    CalendarProps<CalendarEvent>,
    | "onSelectEvent"
    | "onDoubleClickEvent"
    | "onKeyPressEvent"
    | "onSelectSlot"
    | "onNavigate"
    | "selected"
    | "onRangeChange"
> & {
    onEventDrop: (event: EventDropOrResize) => void;
    onEventResize: (event: EventDropOrResize) => void;
};

export function useCalendarEvents(props: CalendarContainerProps): CalendarEventHandlers {
    const { onEditEvent, onCreateEvent, onDragDropResize, onViewRangeChange, editable } = props;
    const clickRef = useRef<NodeJS.Timeout | null>(null);
    const [selected, setSelected] = useState<CalendarEvent | null>(null);

    const invokeEdit = useCallback(
        (event: CalendarEvent) => {
            const action = onEditEvent?.get(event.item);

            if (action?.canExecute) {
                action.execute();
            }
        },
        [onEditEvent]
    );

    const invokeCreate = useCallback(
        (slotInfo: { start: Date; end: Date; action: string }) => {
            const action = onCreateEvent;

            if (action?.canExecute && editable?.value === true) {
                // An event is considered "all day" when the duration is an exact multiple of 24 hours.
                const isAllDay =
                    ((slotInfo.end.getTime() - slotInfo.start.getTime()) / (24 * 60 * 60 * 1000)) % 1 === 0;
                action.execute({
                    startDate: slotInfo.start,
                    endDate: slotInfo.end,
                    allDay: isAllDay
                });
            }
        },
        [onCreateEvent, editable]
    );

    // https://github.com/jquense/react-big-calendar/blob/master/stories/props/onSelectEvent.stories.js
    const handleSelectEvent = useCallback(
        (event: CalendarEvent) => {
            if (clickRef?.current) {
                clearTimeout(clickRef.current);
            }

            clickRef.current = setTimeout(() => {
                if (event.item.id === selected?.item.id) {
                    invokeEdit(event);
                } else {
                    setSelected(event);
                }
            }, 250);
        },
        [invokeEdit, selected]
    );

    // https://github.com/jquense/react-big-calendar/blob/master/stories/props/onDoubleClickEvent.stories.js
    const handleDoubleClickEvent = useCallback(
        (event: CalendarEvent) => {
            if (clickRef?.current) {
                clearTimeout(clickRef.current);
            }

            clickRef.current = setTimeout(() => {
                invokeEdit(event);
                setSelected(event);
            }, 250);
        },
        [invokeEdit]
    );

    const handleKeyPressEvent = useCallback(
        (event: CalendarEvent, e: any) => {
            if (clickRef?.current) {
                clearTimeout(clickRef.current);
            }
            if (e.key === "Enter" && selected?.item.id === event.item.id) {
                invokeEdit(event);
            }
        },
        [invokeEdit, selected]
    );

    const handleCreateEvent = useCallback(
        (slotInfo: { start: Date; end: Date; action: string }) => {
            setSelected(null);
            if (!selected) {
                invokeCreate(slotInfo);
            }
        },
        [invokeCreate, selected]
    );

    const handleEventDropOrResize = useCallback(
        ({ event, start, end }: EventDropOrResize) => {
            const action = onDragDropResize?.get(event.item);
            if (action?.canExecute) {
                action.execute({
                    oldStart: event.start,
                    oldEnd: event.end,
                    newStart: start,
                    newEnd: end
                });
            }
        },
        [onDragDropResize]
    );

    // Track the current view so we can pass it to onRangeChange.
    // RBC calls onNavigate (with view) synchronously before onRangeChange (without view)
    // during navigation, so the ref is always up-to-date when handleRangeChange reads it.
    const currentViewRef = useRef<string | undefined>(undefined);

    const handleNavigate = useCallback((_date: Date, view: string, _action: NavigateAction) => {
        currentViewRef.current = view;
    }, []);

    const handleRangeChange = useCallback(
        (range: Date[] | { start: Date; end: Date }, view?: View) => {
            const action = onViewRangeChange;

            if (action?.canExecute) {
                const start = Array.isArray(range) ? range[0] : range.start;
                const end = Array.isArray(range) ? range[range.length - 1] : range.end;
                const resolvedView = view ?? currentViewRef.current;

                action.execute({
                    rangeStart: start,
                    rangeEnd: end,
                    currentView: resolvedView
                });
            }
        },
        [onViewRangeChange]
    );

    useEffect(() => {
        /**
         * What Is This?
         * This is to prevent a memory leak, in the off chance that you
         * teardown your interface prior to the timed method being called.
         */
        return () => {
            if (clickRef?.current) {
                clearTimeout(clickRef.current);
            }
        };
    }, []);

    return {
        onSelectEvent: handleSelectEvent,
        onDoubleClickEvent: handleDoubleClickEvent,
        onKeyPressEvent: handleKeyPressEvent,
        onSelectSlot: handleCreateEvent,
        onEventDrop: handleEventDropOrResize,
        onEventResize: handleEventDropOrResize,
        onNavigate: handleNavigate,
        onRangeChange: handleRangeChange,
        selected
    };
}
