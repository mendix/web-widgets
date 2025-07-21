import { useCallback, useEffect, useRef, useState } from "react";
import { CalendarEvent, EventDropOrResize } from "../utils/typings";
import { CalendarContainerProps } from "../../typings/CalendarProps";
import { CalendarProps, NavigateAction } from "react-big-calendar";
import { getViewRange } from "../utils/calendar-utils";

type CalendarEventHandlers = Pick<
    CalendarProps<CalendarEvent>,
    "onSelectEvent" | "onDoubleClickEvent" | "onKeyPressEvent" | "onSelectSlot" | "onNavigate" | "selected"
> & {
    onEventDrop: (event: EventDropOrResize) => void;
    onEventResize: (event: EventDropOrResize) => void;
};

export function useCalendarEvents(props: CalendarContainerProps): CalendarEventHandlers {
    const { onEditEvent, onCreateEvent, enableCreate, onDragDropResize, onViewRangeChange } = props;
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

    // https://github.com/jquense/react-big-calendar/blob/master/stories/props/onSelectEvent.stories.js
    const handleSelectEvent = useCallback(
        (event: CalendarEvent) => {
            if (clickRef?.current) {
                clearTimeout(clickRef.current);
            }

            clickRef.current = setTimeout(() => {
                console.log("handleSelectEvent", event);
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
                console.log("handleDoubleClickEvent", event);
                invokeEdit(event);
            }, 250);
        },
        [invokeEdit]
    );

    const handleKeyPressEvent = useCallback(
        (event: CalendarEvent, e: any) => {
            console.log("handleKeyPressEvent", event, e);
            if (e.key === "Enter" && selected?.item.id === event.item.id) {
                invokeEdit(event);
            }
        },
        [invokeEdit, selected]
    );

    const handleCreateEvent = useCallback(
        (slotInfo: { start: Date; end: Date; action: string }) => {
            console.log("handleCreateEvent", slotInfo);
            const action = onCreateEvent;

            if (action?.canExecute && enableCreate) {
                action?.execute({
                    startDate: slotInfo.start,
                    endDate: slotInfo.end,
                    allDay: slotInfo.action === "select"
                });
            }
        },
        [onCreateEvent, enableCreate]
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

    const handleRangeChange = useCallback(
        (date: Date, view: string, _action: NavigateAction) => {
            const action = onViewRangeChange;

            if (action?.canExecute) {
                const { start, end } = getViewRange(view, date);
                action.execute({
                    rangeStart: start,
                    rangeEnd: end,
                    currentView: view
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
    // private invokeEdit(event: CalendarEvent): void {

    // }

    return {
        onSelectEvent: handleSelectEvent,
        onDoubleClickEvent: handleDoubleClickEvent,
        onKeyPressEvent: handleKeyPressEvent,
        onSelectSlot: handleCreateEvent,
        onEventDrop: handleEventDropOrResize,
        onEventResize: handleEventDropOrResize,
        onNavigate: handleRangeChange,
        selected
    };
}
