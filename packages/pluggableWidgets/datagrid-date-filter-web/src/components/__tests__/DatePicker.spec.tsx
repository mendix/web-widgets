import { render } from "@testing-library/react";
import { createElement } from "react";
import ReactDOM from "react-dom";
import { doubleMonthOrDayWhenSingle } from "../../utils/date-utils";
import { DatePicker } from "../DatePicker";

describe("Date picker component", () => {
    beforeAll(() => {
        jest.spyOn(global.Math, "random").mockReturnValue(0.123456789);

        jest.spyOn(ReactDOM, "createPortal").mockImplementation((element, _node, _key) => {
            return element as ReturnType<typeof ReactDOM.createPortal>;
        });
    });

    it("renders correctly", () => {
        const component = render(<DatePicker adjustable expanded={false} onChange={jest.fn()} />);

        expect(component.asFragment()).toMatchSnapshot();
    });

    it("renders correctly when is not adjustable", () => {
        const component = render(<DatePicker adjustable={false} expanded={false} onChange={jest.fn()} />);

        expect(component.asFragment()).toMatchSnapshot();
    });

    it("renders correctly with different locale and date format", () => {
        const component = render(
            <DatePicker
                adjustable={false}
                expanded={false}
                onChange={jest.fn()}
                locale={"fr_FR"}
                dateFormat={"yyyyMMdd"}
            />
        );

        expect(component.asFragment()).toMatchSnapshot();
    });

    it("renders correctly with a11y properties", () => {
        const component = render(
            <DatePicker
                adjustable
                expanded={false}
                onChange={jest.fn()}
                screenReaderInputCaption="my input"
                screenReaderCalendarCaption="my calendar"
            />
        );

        expect(component.asFragment()).toMatchSnapshot();
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
