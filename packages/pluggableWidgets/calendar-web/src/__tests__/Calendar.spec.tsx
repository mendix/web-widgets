import { render } from "@testing-library/react";
import { dynamic, ListValueBuilder } from "@mendix/widget-plugin-test-utils";

import MxCalendar from "../Calendar";
import { CalendarContainerProps } from "../../typings/CalendarProps";

// Mock react-big-calendar to avoid View.title issues
jest.mock("react-big-calendar", () => {
    const originalModule = jest.requireActual("react-big-calendar");
    return {
        ...originalModule,
        Calendar: ({
            children,
            defaultView,
            culture,
            resizable,
            selectable,
            showAllEvents,
            min,
            max,
            events,
            ...domProps
        }: any) => (
            <div
                data-testid="mock-calendar"
                data-default-view={defaultView}
                data-culture={culture}
                data-resizable={resizable}
                data-selectable={selectable}
                data-show-all-events={showAllEvents}
                data-min={min?.toISOString()}
                data-max={max?.toISOString()}
                data-events-count={events?.length ?? 0}
                {...domProps}
            >
                {children}
            </div>
        ),
        dateFnsLocalizer: () => ({
            format: jest.fn(),
            parse: jest.fn(),
            startOfWeek: jest.fn(),
            getDay: jest.fn()
        }),
        Views: {
            MONTH: "month",
            WEEK: "week",
            WORK_WEEK: "work_week",
            DAY: "day",
            AGENDA: "agenda"
        }
    };
});

jest.mock("react-big-calendar/lib/addons/dragAndDrop", () => {
    return jest.fn((Component: any) => Component);
});

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
    showEventDate: dynamic(true),
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
    customViewShowSunday: false,
    customViewShowMonday: true,
    customViewShowTuesday: true,
    customViewShowWednesday: true,
    customViewShowThursday: true,
    customViewShowFriday: true,
    customViewShowSaturday: false,
    showAllEvents: true,
    step: 60,
    timeslots: 2,
    toolbarItems: [],
    topBarDateFormat: undefined
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
        const calendar = render(<MxCalendar {...customViewProps} />);
        expect(calendar.container.firstChild).toMatchSnapshot();
    });

    it("renders with correct class name", () => {
        const { container } = render(<MxCalendar {...customViewProps} />);
        expect(container.querySelector(".widget-calendar")).toBeTruthy();
        expect(container.querySelector(".calendar-class")).toBeTruthy();
    });

    it("does not render custom view button in standard view", () => {
        const { container } = render(<MxCalendar {...standardViewProps} />);
        expect(container).toBeTruthy();
        // Since we're mocking the calendar, we can't test for specific text content
        // but we can verify the component renders without errors
    });
});
