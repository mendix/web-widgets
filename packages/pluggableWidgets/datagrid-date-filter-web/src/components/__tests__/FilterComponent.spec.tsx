import { render } from "enzyme";
import { createElement } from "react";
import { render as render_fromTestingLibrary } from "@testing-library/react";
import { FilterComponent, FilterComponentProps } from "../FilterComponent";
import ReactDOM from "react-dom";

const commonProps: FilterComponentProps = {
    name: "DateFilter",
    parentChannelName: null,
    adjustable: true,
    defaultFilter: "equal"
};

describe("Filter component", () => {
    beforeAll(() => {
        jest.spyOn(global.Math, "random").mockReturnValue(0.123456789);

        // @ts-ignore
        jest.spyOn(ReactDOM, "createPortal").mockReturnValue((element, node) => {
            return element;
        });
    });

    it("renders correctly", () => {
        const component = render(<FilterComponent {...commonProps} />);

        expect(component).toMatchSnapshot();
    });

    it("renders correctly when not adjustable by user", () => {
        const component = render(<FilterComponent {...commonProps} adjustable={false} />);

        expect(component).toMatchSnapshot();
    });

    it("renders correctly with aria labels", () => {
        const component = render(
            <FilterComponent
                {...commonProps}
                screenReaderButtonCaption="my label"
                screenReaderInputCaption="my label"
            />
        );

        expect(component).toMatchSnapshot();
    });

    describe("with defaultValue", () => {
        it("don't call updateFilters when defaultValue get new value", () => {
            const date = new Date(946684800000);
            const updateFilters = jest.fn();
            const { rerender } = render_fromTestingLibrary(
                <FilterComponent {...commonProps} defaultValue={date} updateFilters={updateFilters} />
            );

            // First time updateFilters is called on initial mount
            expect(updateFilters).toBeCalledTimes(1);
            expect(updateFilters).toHaveBeenLastCalledWith(date, [undefined, undefined], "equal");

            const nextValue = new Date(999999900000);

            rerender(<FilterComponent {...commonProps} defaultValue={nextValue} updateFilters={updateFilters} />);

            expect(updateFilters).toBeCalledTimes(1);
            expect(updateFilters).toHaveBeenLastCalledWith(date, [undefined, undefined], "equal");
        });

        it("don't call updateFilters when defaultValue get same value", () => {
            const date = new Date(946684800000);
            const updateFilters = jest.fn();
            const { rerender } = render_fromTestingLibrary(
                <FilterComponent {...commonProps} defaultValue={date} updateFilters={updateFilters} />
            );

            // First time updateFilters is called on initial mount
            expect(updateFilters).toBeCalledTimes(1);
            expect(updateFilters.mock.calls[0][0]).toBe(date);

            const nextValue = new Date(946684800000);

            rerender(<FilterComponent {...commonProps} defaultValue={nextValue} updateFilters={updateFilters} />);

            expect(updateFilters).toBeCalledTimes(1);
        });
    });
});
