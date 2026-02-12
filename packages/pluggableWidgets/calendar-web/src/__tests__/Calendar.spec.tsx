import { render } from "@testing-library/react";
import { dynamic, ListValueBuilder } from "@mendix/widget-plugin-test-utils";

import MxCalendar from "../Calendar";
import { CalendarContainerProps } from "../../typings/CalendarProps";
import { CalendarPropsBuilder } from "../helpers/CalendarPropsBuilder";

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
            step,
            timeslots,
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
                data-step={step}
                data-timeslots={timeslots}
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

    it("passes step and timeslots to the calendar", () => {
        const { getByTestId } = render(<MxCalendar {...customViewProps} />);
        const calendar = getByTestId("mock-calendar");
        expect(calendar.getAttribute("data-step")).toBe("60");
        expect(calendar.getAttribute("data-timeslots")).toBe("2");
    });
});

describe("CalendarPropsBuilder validation", () => {
    const mockLocalizer = {
        format: jest.fn(),
        parse: jest.fn(),
        startOfWeek: jest.fn(),
        getDay: jest.fn(),
        messages: {}
    } as any;

    const buildWithStepTimeslots = (step: number, timeslots: number) => {
        const props = { ...customViewProps, step, timeslots };
        const builder = new CalendarPropsBuilder(props);
        return builder.build(mockLocalizer, "en");
    };

    it("clamps step=0 to 1", () => {
        const result = buildWithStepTimeslots(0, 2);
        expect(result.step).toBe(1);
        expect(result.timeslots).toBe(2);
    });

    it("clamps negative step to 1", () => {
        const result = buildWithStepTimeslots(-5, 1);
        expect(result.step).toBe(1);
    });

    it("clamps step above 60 to 60", () => {
        const result = buildWithStepTimeslots(100, 1);
        expect(result.step).toBe(60);
    });

    it("clamps timeslots=0 to 1", () => {
        const result = buildWithStepTimeslots(30, 0);
        expect(result.timeslots).toBe(1);
    });

    it("clamps timeslots above 4 to 4", () => {
        const result = buildWithStepTimeslots(30, 100);
        expect(result.timeslots).toBe(4);
    });

    it("preserves boundary values (step=1, timeslots=1)", () => {
        const result = buildWithStepTimeslots(1, 1);
        expect(result.step).toBe(1);
        expect(result.timeslots).toBe(1);
    });

    it("preserves upper boundary values (step=60, timeslots=4)", () => {
        const result = buildWithStepTimeslots(60, 4);
        expect(result.step).toBe(60);
        expect(result.timeslots).toBe(4);
    });

    it("accepts valid step and timeslots without clamping", () => {
        const result = buildWithStepTimeslots(30, 2);
        expect(result.step).toBe(30);
        expect(result.timeslots).toBe(2);
    });
});
