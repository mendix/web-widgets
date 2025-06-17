import { createElement } from "react";
import { render } from "@testing-library/react";
import { ListValueBuilder } from "@mendix/widget-plugin-test-utils";

import Calendar from "../Calendar";
import { CalendarContainerProps } from "../../typings/CalendarProps";
const defaultProps: CalendarContainerProps = {
    name: "calendar-test",
    class: "calendar-class",
    tabIndex: 0,
    databaseDataSource: new ListValueBuilder().withItems([]).build(),
    titleType: "attribute",
    view: "custom",
    defaultView: "work_week",
    editable: "default",
    enableCreate: true,
    widthUnit: "percentage",
    width: 100,
    heightUnit: "pixels",
    height: 400,
    minHour: 0,
    maxHour: 24,
    minHeightUnit: "pixels",
    minHeight: 400,
    maxHeightUnit: "none",
    maxHeight: 400,
    overflowY: "auto",
    showEventDate: true,
    showSunday: false,
    showMonday: true,
    showTuesday: true,
    showWednesday: true,
    showThursday: true,
    showFriday: true,
    showSaturday: false,
    showAllEvents: true
};

beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2025-04-28T12:00:00Z"));
});

afterAll(() => {
    jest.useRealTimers();
});

describe("Calendar", () => {
    it("renders correctly with basic props", () => {
        const calendar = render(<Calendar {...defaultProps} />);
        expect(calendar).toMatchSnapshot();
    });

    it("renders with correct class name", () => {
        const { container } = render(<Calendar {...defaultProps} />);
        expect(container.querySelector(".widget-calendar")).toBeTruthy();
        expect(container.querySelector(".calendar-class")).toBeTruthy();
    });
});
