import { render, screen } from "@testing-library/react";
import { ToolbarProps } from "react-big-calendar";

import { createConfigurableToolbar, CustomToolbar, ResolvedToolbarItem } from "../Toolbar";

const localizer = {
    messages: {
        today: "Today",
        day: "Day",
        week: "Week",
        month: "Month",
        agenda: "Agenda"
        // Deliberately no "year" key: react-big-calendar's Messages type has none,
        // this is the exact condition that produced a blank Year button (B1).
    }
} as any;

function baseToolbarProps(overrides: Record<string, unknown> = {}): ToolbarProps {
    return {
        label: "2026",
        localizer,
        onNavigate: jest.fn(),
        onView: jest.fn(),
        view: "month",
        views: ["day", "week", "month"],
        ...overrides
    } as unknown as ToolbarProps;
}

describe("CustomToolbar (Standard mode)", () => {
    it("renders a non-empty caption for the year view button", () => {
        const props = baseToolbarProps({ views: ["day", "week", "month", "year"] as any, view: "year" });
        render(<CustomToolbar {...props} />);

        const yearButton = screen.getByText("Year");
        expect(yearButton).toBeTruthy();
        expect(yearButton.closest("button")?.className).toContain("active");
    });

    it("still renders known views using localizer messages", () => {
        render(<CustomToolbar {...baseToolbarProps()} />);
        expect(screen.getByText("Day")).toBeTruthy();
        expect(screen.getByText("Month").closest("button")?.className).toContain("active");
    });

    it("calls onView('year') when the year button is clicked", () => {
        const onView = jest.fn();
        const props = baseToolbarProps({ views: ["month", "year"] as any, onView });
        render(<CustomToolbar {...props} />);

        screen.getByText("Year").click();

        expect(onView).toHaveBeenCalledWith("year");
    });
});

describe("createConfigurableToolbar (Custom mode)", () => {
    const yearItem: ResolvedToolbarItem = {
        itemType: "year",
        position: "right",
        renderMode: "button"
    };

    it("renders a default 'Year' caption when none is configured", () => {
        const Toolbar = createConfigurableToolbar([yearItem]);
        render(<Toolbar {...baseToolbarProps()} />);

        expect(screen.getByText("Year")).toBeTruthy();
    });

    it("renders a custom caption for the year button when configured", () => {
        const Toolbar = createConfigurableToolbar([{ ...yearItem, caption: "Annual View" }]);
        render(<Toolbar {...baseToolbarProps()} />);

        expect(screen.getByText("Annual View")).toBeTruthy();
    });

    it("marks the year button active when view is 'year'", () => {
        const Toolbar = createConfigurableToolbar([yearItem]);
        render(<Toolbar {...baseToolbarProps({ view: "year" as any })} />);

        expect(screen.getByText("Year").closest("button")?.className).toContain("active");
    });
});
