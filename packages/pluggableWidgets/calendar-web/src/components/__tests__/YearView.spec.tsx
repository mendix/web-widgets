import { render, screen } from "@testing-library/react";
import { CalendarProps } from "react-big-calendar";
import { obj } from "@mendix/widget-plugin-test-utils";

import { CalendarEvent } from "../../utils/typings";
import { YearView } from "../YearView";

// MonthMiniGrid is rendered 12x per YearView; stub it so these tests can assert
// on grouping/wiring without depending on its internal rendering. The stub reflects
// interactivity via a data attribute and only wires the click button when onDayClick
// is provided (mirroring the real component's non-interactive mode).
jest.mock("../MonthMiniGrid", () => ({
    MonthMiniGrid: ({ month, events, onDayClick }: any) => (
        <div data-testid={`month-${month}`} data-event-count={events.length} data-interactive={Boolean(onDayClick)}>
            {events.map((e: CalendarEvent) => (
                <span key={e.title}>{e.title}</span>
            ))}
            {onDayClick && (
                <button data-testid={`day-click-${month}`} onClick={() => onDayClick(new Date(2026, month, 1))}>
                    click
                </button>
            )}
        </div>
    )
}));

function makeEvent(title: string, start: Date, end: Date, allDay = false): CalendarEvent {
    return { title, start, end, allDay, item: obj() };
}

const localizer = { format: jest.fn(), messages: {} } as any;

function renderYearView(overrides: Partial<CalendarProps> & { dayClickView?: string } = {}): ReturnType<
    typeof render
> & {
    onDrillDown: jest.Mock;
} {
    const onDrillDown = jest.fn();
    const props = {
        date: new Date(2026, 5, 15),
        events: [],
        localizer,
        onDrillDown,
        // Default to "day" so grouping/rendering tests keep exercising the interactive path.
        dayClickView: "day",
        ...overrides
    } as unknown as CalendarProps;

    const utils = render(<YearView {...props} />);
    return { ...utils, onDrillDown };
}

describe("YearView", () => {
    it("renders a 12-month grid", () => {
        renderYearView();
        for (let m = 0; m < 12; m++) {
            expect(screen.getByTestId(`month-${m}`)).toBeTruthy();
        }
    });

    it("defaults to the current date when no date prop is given", () => {
        const { container } = render(<YearView {...({ events: [], localizer, onDrillDown: jest.fn() } as any)} />);
        expect(container.querySelector(".widget-calendar-year-view")).toBeTruthy();
    });

    it("groups a same-month event into that month only", () => {
        const event = makeEvent("Standup", new Date(2026, 2, 10), new Date(2026, 2, 10));
        renderYearView({ events: [event] } as any);

        expect(screen.getByTestId("month-2").getAttribute("data-event-count")).toBe("1");
        expect(screen.getByTestId("month-1").getAttribute("data-event-count")).toBe("0");
    });

    it("groups a multi-month event into every month it spans", () => {
        // March 25 -> April 5
        const event = makeEvent("Conference", new Date(2026, 2, 25), new Date(2026, 3, 5));
        renderYearView({ events: [event] } as any);

        expect(screen.getByTestId("month-2").getAttribute("data-event-count")).toBe("1");
        expect(screen.getByTestId("month-3").getAttribute("data-event-count")).toBe("1");
        expect(screen.getByTestId("month-4").getAttribute("data-event-count")).toBe("0");
    });

    it("assigns a Dec -> Jan boundary event to December of the displayed year", () => {
        // Event spans Dec 28, 2025 -> Jan 3, 2026; viewing year 2026.
        const event = makeEvent("Holiday break", new Date(2025, 11, 28), new Date(2026, 0, 3));
        renderYearView({ date: new Date(2026, 5, 1), events: [event] } as any);

        // January (month 0) of 2026 must still show the event even though the
        // event's start date belongs to 2025.
        expect(screen.getByTestId("month-0").getAttribute("data-event-count")).toBe("1");
    });

    it("assigns a Nov -> Feb (next year) event only to the months within the displayed year", () => {
        // Event spans Nov 2026 -> Feb 2027; viewing year 2026 should only see Nov/Dec.
        const event = makeEvent("Long project", new Date(2026, 10, 1), new Date(2027, 1, 15));
        renderYearView({ date: new Date(2026, 5, 1), events: [event] } as any);

        expect(screen.getByTestId("month-10").getAttribute("data-event-count")).toBe("1");
        expect(screen.getByTestId("month-11").getAttribute("data-event-count")).toBe("1");
    });

    it("does not assign an event that falls entirely outside the displayed year", () => {
        const event = makeEvent("Next year only", new Date(2027, 0, 5), new Date(2027, 0, 6));
        renderYearView({ date: new Date(2026, 5, 1), events: [event] } as any);

        for (let m = 0; m < 12; m++) {
            expect(screen.getByTestId(`month-${m}`).getAttribute("data-event-count")).toBe("0");
        }
    });

    it("drills down to the day-click target view when a day cell is clicked", () => {
        const { onDrillDown } = renderYearView();

        screen.getByTestId("day-click-3").click();

        // Uses RBC's onDrillDown (not onNavigate+onView directly) so the target view
        // is validated against the calendar's enabled views before switching.
        expect(onDrillDown).toHaveBeenCalledWith(new Date(2026, 3, 1), "day");
    });

    it("drills down to a non-day target when configured (e.g. month)", () => {
        const { onDrillDown } = renderYearView({ dayClickView: "month" });

        screen.getByTestId("day-click-3").click();

        expect(onDrillDown).toHaveBeenCalledWith(new Date(2026, 3, 1), "month");
    });

    it("disables day-click when no target view is resolved", () => {
        const { onDrillDown } = renderYearView({ dayClickView: undefined });

        // Non-interactive: the stub renders no click button and cells are marked as such.
        expect(screen.queryByTestId("day-click-3")).toBeNull();
        expect(screen.getByTestId("month-3").getAttribute("data-interactive")).toBe("false");
        expect(onDrillDown).not.toHaveBeenCalled();
    });
});
