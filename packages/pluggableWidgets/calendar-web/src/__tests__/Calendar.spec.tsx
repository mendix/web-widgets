import { createElement } from "react";
import { render } from "@testing-library/react";
import { dynamic, ListValueBuilder } from "@mendix/widget-plugin-test-utils";

import Calendar from "../Calendar";
import { CalendarContainerProps } from "../../typings/CalendarProps";
const customViewProps: CalendarContainerProps = {
    name: "calendar-test",
    class: "calendar-class",
    tabIndex: 0,
    databaseDataSource: new ListValueBuilder().withItems([]).build(),
    titleType: "attribute",
    view: "custom",
    defaultViewStandard: "month",
    defaultViewCustom: "work_week",
    editable: dynamic(true),
    enableCreate: dynamic(true),
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
    customViewShowSunday: false,
    customViewShowMonday: true,
    customViewShowTuesday: true,
    customViewShowWednesday: true,
    customViewShowThursday: true,
    customViewShowFriday: true,
    customViewShowSaturday: false,
    showAllEvents: true
};

const standardViewProps: CalendarContainerProps = {
    ...customViewProps,
    view: "standard"
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
        const calendar = render(<Calendar {...customViewProps} />);
        expect(calendar).toMatchSnapshot();
    });

    it("renders with correct class name", () => {
        const { container } = render(<Calendar {...customViewProps} />);
        expect(container.querySelector(".widget-calendar")).toBeTruthy();
        expect(container.querySelector(".calendar-class")).toBeTruthy();
    });

    it("does not render custom view button in standard view", () => {
        const { queryByText } = render(<Calendar {...standardViewProps} />);
        expect(queryByText("Custom")).toBeNull();
    });
});
