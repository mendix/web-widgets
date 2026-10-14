import { fireEvent, render, screen } from "@testing-library/react";
import { obj } from "@mendix/widget-plugin-test-utils";

import { CalendarEvent } from "../../utils/typings";
import { MonthMiniGrid } from "../MonthMiniGrid";

function makeEvent(title: string, start: Date, end: Date, allDay = false): CalendarEvent {
    return { title, start, end, allDay, item: obj() };
}

// Minimal localizer stub: return a stable, human-readable token for month names
// and one-letter-per-day-of-week headers so assertions don't depend on real Intl formatting.
const localizer = {
    format: (date: Date, pattern: string) => {
        if (pattern === "MMM") {
            return date.toLocaleDateString("en-US", { month: "short" });
        }
        if (pattern === "EEEEEE") {
            return date.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 2);
        }
        return date.toISOString();
    }
} as any;

beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-03-15T12:00:00Z"));
});

afterAll(() => {
    jest.useRealTimers();
});

describe("MonthMiniGrid", () => {
    it("renders the localized month header", () => {
        render(<MonthMiniGrid year={2026} month={2} events={[]} onDayClick={jest.fn()} localizer={localizer} />);
        expect(screen.getByRole("heading", { name: "Mar" })).toBeTruthy();
    });

    it("renders 7 weekday headers", () => {
        const { container } = render(
            <MonthMiniGrid year={2026} month={2} events={[]} onDayClick={jest.fn()} localizer={localizer} />
        );
        expect(container.querySelectorAll(".year-weekday-header")).toHaveLength(7);
    });

    it("renders leading days from the previous month in gray", () => {
        // March 2026 starts on a Sunday, so there should be no leading days.
        // Use April 2026 (starts on Wednesday) to exercise leading days.
        const { container } = render(
            <MonthMiniGrid year={2026} month={3} events={[]} onDayClick={jest.fn()} localizer={localizer} />
        );
        const leadingCells = container.querySelectorAll(".year-day-cell-other-month");
        expect(leadingCells.length).toBeGreaterThan(0);
    });

    it("marks today's cell with the today class", () => {
        // Fake system time is set to 2026-03-15
        const { container } = render(
            <MonthMiniGrid year={2026} month={2} events={[]} onDayClick={jest.fn()} localizer={localizer} />
        );
        const todayCell = container.querySelector(".year-day-cell-today");
        expect(todayCell).toBeTruthy();
        expect(todayCell?.textContent).toContain("15");
    });

    it("does not highlight any cell as today when viewing a different month", () => {
        const { container } = render(
            <MonthMiniGrid year={2025} month={2} events={[]} onDayClick={jest.fn()} localizer={localizer} />
        );
        expect(container.querySelector(".year-day-cell-today")).toBeFalsy();
    });

    it("shows an event dot on a day with events, and none on days without", () => {
        const event = makeEvent("Review", new Date(2026, 2, 10, 9, 0), new Date(2026, 2, 10, 10, 0));
        const { container } = render(
            <MonthMiniGrid year={2026} month={2} events={[event]} onDayClick={jest.fn()} localizer={localizer} />
        );

        const cellsWithDots = container.querySelectorAll(".year-event-dot");
        expect(cellsWithDots).toHaveLength(1);

        const hasEventCell = container.querySelector(".year-day-cell-has-event");
        expect(hasEventCell?.textContent).toContain("10");
    });

    it("treats an all-day event as occurring on every day in its range", () => {
        const event = makeEvent("Offsite", new Date(2026, 2, 10), new Date(2026, 2, 12), true);
        const { container } = render(
            <MonthMiniGrid year={2026} month={2} events={[event]} onDayClick={jest.fn()} localizer={localizer} />
        );

        expect(container.querySelectorAll(".year-day-cell-has-event")).toHaveLength(3);
    });

    it("calls onDayClick with the cell's date when a day cell is clicked", () => {
        const onDayClick = jest.fn();
        render(<MonthMiniGrid year={2026} month={2} events={[]} onDayClick={onDayClick} localizer={localizer} />);

        screen.getByText("10").click();

        expect(onDayClick).toHaveBeenCalledTimes(1);
        const clickedDate: Date = onDayClick.mock.calls[0][0];
        expect(clickedDate.getFullYear()).toBe(2026);
        expect(clickedDate.getMonth()).toBe(2);
        expect(clickedDate.getDate()).toBe(10);
    });

    it("calls onDayClick on Enter and Space key presses", () => {
        const onDayClick = jest.fn();
        render(<MonthMiniGrid year={2026} month={2} events={[]} onDayClick={onDayClick} localizer={localizer} />);

        const cell = screen.getByText("10").closest(".year-day-cell") as HTMLElement;
        cell.focus();

        fireEvent.keyDown(cell, { key: "Enter" });
        fireEvent.keyDown(cell, { key: " " });

        expect(onDayClick).toHaveBeenCalledTimes(2);
    });

    it("sets an aria-label describing the date and event count", () => {
        const event = makeEvent("Review", new Date(2026, 2, 10, 9, 0), new Date(2026, 2, 10, 10, 0));
        render(<MonthMiniGrid year={2026} month={2} events={[event]} onDayClick={jest.fn()} localizer={localizer} />);

        expect(screen.getByLabelText("Mar 10, 2026, 1 event")).toBeTruthy();
        expect(screen.getByLabelText("Mar 11, 2026, no events")).toBeTruthy();
    });

    it("uses the correct month and year in aria-label for leading (other-month) cells", () => {
        // April 2026 starts on Wednesday — first 3 cells are Mar 29, 30, 31
        render(<MonthMiniGrid year={2026} month={3} events={[]} onDayClick={jest.fn()} localizer={localizer} />);
        expect(screen.getByLabelText("Mar 31, 2026, no events")).toBeTruthy();
    });

    describe("when onDayClick is omitted (non-interactive)", () => {
        it("renders cells without button role or tab stop", () => {
            const { container } = render(<MonthMiniGrid year={2026} month={2} events={[]} localizer={localizer} />);

            const cell = screen.getByText("10").closest(".year-day-cell") as HTMLElement;
            expect(cell.getAttribute("role")).toBeNull();
            expect(cell.getAttribute("tabindex")).toBeNull();
            // No cell should be exposed as a button.
            expect(container.querySelectorAll('[role="button"]')).toHaveLength(0);
        });

        it("keeps the aria-label so date and event count remain readable", () => {
            const event = makeEvent("Review", new Date(2026, 2, 10, 9, 0), new Date(2026, 2, 10, 10, 0));
            render(<MonthMiniGrid year={2026} month={2} events={[event]} localizer={localizer} />);

            expect(screen.getByLabelText("Mar 10, 2026, 1 event")).toBeTruthy();
        });
    });
});
