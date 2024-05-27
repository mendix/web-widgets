import { createElement } from "react";
import { render as renderEnzyme } from "enzyme";
import { fireEvent, render } from "@testing-library/react";
import { DatePicker } from "../DatePicker";
import ReactDOM from "react-dom";
import { doubleMonthOrDayWhenSingle } from "../../utils/date-utils";
import { CalendarStore } from "../../helpers/store/CalendarStore";
import { DatePickerController } from "../../helpers/DatePickerController";
import { FilterStore } from "../../helpers/store/FilterStore";

function createDeps(): {
    filterStore: FilterStore;
    calendarStore: CalendarStore;
    datePickerController: DatePickerController;
} {
    const fs = new FilterStore();
    const cs = new CalendarStore();
    const ctrl = new DatePickerController(fs, cs);
    return { filterStore: fs, calendarStore: cs, datePickerController: ctrl };
}

describe("Date picker component", () => {
    beforeAll(() => {
        jest.spyOn(global.Math, "random").mockReturnValue(0.123456789);

        jest.spyOn(ReactDOM, "createPortal").mockImplementation((element, _node, _key) => {
            return element as ReturnType<typeof ReactDOM.createPortal>;
        });
    });

    it("renders correctly", () => {
        const component = renderEnzyme(<DatePicker adjustable {...createDeps()} />);

        expect(component).toMatchSnapshot();
    });

    it("renders correctly when is not adjustable", () => {
        const component = renderEnzyme(<DatePicker adjustable={false} {...createDeps()} />);

        expect(component).toMatchSnapshot();
    });

    it("renders correctly with different locale and date format", () => {
        const component = renderEnzyme(<DatePicker adjustable={false} {...createDeps()} />);

        expect(component).toMatchSnapshot();
    });

    it("renders correctly with a11y properties", () => {
        const component = renderEnzyme(
            <DatePicker
                adjustable
                {...createDeps()}
                screenReaderInputCaption="my input"
                screenReaderCalendarCaption="my calendar"
            />
        );

        expect(component).toMatchSnapshot();
    });

    it("emits change event on when input changes", async () => {
        const listener = jest.fn();
        const deps = createDeps();
        const component = render(<DatePicker adjustable {...deps} placeholder="Date input" />);

        deps.filterStore.addEventListener("change", listener);

        fireEvent.change(component.getByPlaceholderText("Date input"), { target: { value: "01/25/2020" } });

        expect(listener).toHaveBeenCalledTimes(1);
        expect(deps.filterStore.state.value as Date).toEqual(new Date("01/25/2020"));
    });

    test.each([
        ["d/m/yyyy", "dd/m/yyyy"],
        ["dd/m/yyyy", "dd/m/yyyy"],
        ["d/MM/yyyy", "dd/MM/yyyy"],
        ["d-m-yyyy", "dd-m-yyyy"],
        ["d-mm-yyyy", "dd-mm-yyyy"],
        ["d-M-yyyy", "dd-MM-yyyy"],
        ["d-MM-yyyy", "dd-MM-yyyy"],
        ["dd-m-yyyy", "dd-m-yyyy"],
        ["dd-mm-yyyy", "dd-mm-yyyy"],
        ["dd-M-yyyy", "dd-MM-yyyy"],
        ["dd-MM-yyyy", "dd-MM-yyyy"],
        ["dd/MM/yyyy", "dd/MM/yyyy"],
        ["d/MM/yyyy", "dd/MM/yyyy"],
        ["d/M/yyyy", "dd/MM/yyyy"],
        ["dd/M/yyyy", "dd/MM/yyyy"],
        ["dd/m/yyyy", "dd/m/yyyy"],
        ["dd/mm/yyyy", "dd/mm/yyyy"],
        ["yyyy-MM-dd", "yyyy-MM-dd"],
        ["yyyy-MM-d", "yyyy-MM-dd"],
        ["yyyy-m-d", "yyyy-m-dd"],
        ["yyyy-mm-dd", "yyyy-mm-dd"],
        ["yyyy-mm-d", "yyyy-mm-dd"],
        ["yyyy.MM.dd", "yyyy.MM.dd"],
        ["yyyy.M.d", "yyyy.MM.dd"],
        ["yyyy.MM.d", "yyyy.MM.dd"],
        ["yyyy.m.dd", "yyyy.m.dd"],
        ["yyyy.M.dd", "yyyy.MM.dd"],
        ["yyyy.mm.dd", "yyyy.mm.dd"],
        ["yyyy.mm.d", "yyyy.mm.dd"],
        ["yyyyMMdd", "yyyyMMdd"],
        ["yyyyMdd", "yyyyMMdd"],
        ["dMMyyyy", "ddMMyyyy"],
        ["ddMMyyyy", "ddMMyyyy"],
        ["ddMyyyy", "ddMMyyyy"]
    ])("expect for input %p output to be %p", (input, expected) => {
        expect(doubleMonthOrDayWhenSingle(input)).toStrictEqual(expected);
    });
});
