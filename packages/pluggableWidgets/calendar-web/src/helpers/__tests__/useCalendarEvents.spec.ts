import { act, renderHook } from "@testing-library/react";
import { ActionValue, ListActionValue, ObjectItem } from "mendix";
import { CalendarContainerProps, OnClickTriggerEnum } from "../../../typings/CalendarProps";
import { CalendarEvent } from "../../utils/typings";
import { useCalendarEvents } from "../useCalendarEvents";

function createEvent(id: string): CalendarEvent {
    return {
        title: `Event ${id}`,
        start: new Date(2026, 0, 1, 10, 0),
        end: new Date(2026, 0, 1, 11, 0),
        allDay: false,
        item: { id } as unknown as ObjectItem
    };
}

function setup(onClickTrigger: OnClickTriggerEnum): {
    execute: jest.Mock;
    create: jest.Mock;
    props: CalendarContainerProps;
} {
    const execute = jest.fn();
    const create = jest.fn();
    const onEditEvent = {
        get: () => ({ canExecute: true, isExecuting: false, execute }) as unknown as ActionValue
    } as unknown as ListActionValue;
    const onCreateEvent = { canExecute: true, isExecuting: false, execute: create } as unknown as ActionValue;

    return {
        execute,
        create,
        props: {
            onClickTrigger,
            onEditEvent,
            onCreateEvent,
            editable: { status: "available", value: true }
        } as unknown as CalendarContainerProps
    };
}

const slot = { start: new Date(2026, 0, 2, 9, 0), end: new Date(2026, 0, 2, 10, 0), action: "select" };

describe("useCalendarEvents", () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    describe("with onClickTrigger 'single'", () => {
        it("invokes the edit action on the first click, without waiting", () => {
            const { execute, props } = setup("single");
            const { result } = renderHook(() => useCalendarEvents(props));
            const event = createEvent("1");

            act(() => {
                result.current.onSelectEvent!(event, {} as any);
            });

            expect(execute).toHaveBeenCalledTimes(1);
        });

        it("selects the event so keyboard edit keeps working", () => {
            const { execute, props } = setup("single");
            const { result } = renderHook(() => useCalendarEvents(props));
            const event = createEvent("1");

            act(() => {
                result.current.onSelectEvent!(event, {} as any);
            });
            expect(result.current.selected).toBe(event);

            act(() => {
                result.current.onKeyPressEvent!(event, { key: "Enter" } as any);
            });
            expect(execute).toHaveBeenCalledTimes(2);
        });

        it("invokes the edit action only once on a real double click", () => {
            const { execute, props } = setup("single");
            const { result } = renderHook(() => useCalendarEvents(props));
            const event = createEvent("1");

            // react-big-calendar fires onSelectEvent before onDoubleClickEvent
            act(() => {
                result.current.onSelectEvent!(event, {} as any);
                result.current.onDoubleClickEvent!(event, {} as any);
            });
            act(() => {
                jest.advanceTimersByTime(500);
            });

            expect(execute).toHaveBeenCalledTimes(1);
        });
    });

    describe("with onClickTrigger 'double'", () => {
        it("only selects the event on the first click", () => {
            const { execute, props } = setup("double");
            const { result } = renderHook(() => useCalendarEvents(props));
            const event = createEvent("1");

            act(() => {
                result.current.onSelectEvent!(event, {} as any);
                jest.advanceTimersByTime(250);
            });

            expect(execute).not.toHaveBeenCalled();
            expect(result.current.selected).toBe(event);
        });

        it("invokes the edit action on a second click on the selected event", () => {
            const { execute, props } = setup("double");
            const { result } = renderHook(() => useCalendarEvents(props));
            const event = createEvent("1");

            act(() => {
                result.current.onSelectEvent!(event, {} as any);
                jest.advanceTimersByTime(250);
            });
            act(() => {
                result.current.onSelectEvent!(event, {} as any);
                jest.advanceTimersByTime(250);
            });

            expect(execute).toHaveBeenCalledTimes(1);
        });

        it("invokes the edit action once on a real double click", () => {
            const { execute, props } = setup("double");
            const { result } = renderHook(() => useCalendarEvents(props));
            const event = createEvent("1");

            act(() => {
                result.current.onSelectEvent!(event, {} as any);
                result.current.onDoubleClickEvent!(event, {} as any);
            });
            act(() => {
                jest.advanceTimersByTime(250);
            });

            expect(execute).toHaveBeenCalledTimes(1);
        });

        it("invokes the edit action on Enter when the event is selected", () => {
            const { execute, props } = setup("double");
            const { result } = renderHook(() => useCalendarEvents(props));
            const event = createEvent("1");

            act(() => {
                result.current.onSelectEvent!(event, {} as any);
                jest.advanceTimersByTime(250);
            });
            act(() => {
                result.current.onKeyPressEvent!(event, { key: "Enter" } as any);
            });

            expect(execute).toHaveBeenCalledTimes(1);
        });
    });

    // The trigger property must not leak into slot selection: creating events stays
    // driven by onSelectSlot and behaves identically in both modes.
    describe.each<OnClickTriggerEnum>(["single", "double"])("slot selection with '%s' mode", trigger => {
        it("invokes the create action when no event is selected", () => {
            const { create, props } = setup(trigger);
            const { result } = renderHook(() => useCalendarEvents(props));

            act(() => {
                result.current.onSelectSlot!(slot as any);
            });

            expect(create).toHaveBeenCalledTimes(1);
        });

        it("only clears the selection when an event is selected", () => {
            const { create, props } = setup(trigger);
            const { result } = renderHook(() => useCalendarEvents(props));
            const event = createEvent("1");

            act(() => {
                result.current.onSelectEvent!(event, {} as any);
                jest.advanceTimersByTime(250);
            });
            act(() => {
                result.current.onSelectSlot!(slot as any);
            });

            expect(create).not.toHaveBeenCalled();
            expect(result.current.selected).toBeNull();
        });
    });
});
