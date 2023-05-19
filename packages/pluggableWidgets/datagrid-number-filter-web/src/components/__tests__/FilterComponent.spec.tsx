import { render, mount } from "enzyme";
import { createElement } from "react";
import { FilterComponent } from "../FilterComponent";

jest.useFakeTimers();

describe("Filter component", () => {
    it("renders correctly", () => {
        const component = render(<FilterComponent adjustable initialFilterType="equal" inputChangeDelay={500} />);

        expect(component).toMatchSnapshot();
    });

    it("renders correctly when not adjustable by user", () => {
        const component = render(
            <FilterComponent adjustable={false} initialFilterType="equal" inputChangeDelay={500} />
        );

        expect(component).toMatchSnapshot();
    });

    it("renders correctly with aria labels", () => {
        const component = render(
            <FilterComponent
                adjustable
                initialFilterType="equal"
                inputChangeDelay={500}
                screenReaderButtonCaption="my label"
                screenReaderInputCaption="my label"
            />
        );

        expect(component).toMatchSnapshot();
    });

    it("calls updateFilters when value changes", () => {
        const updateFiltersHandler = jest.fn();
        const component = mount(
            <FilterComponent
                initialFilterType="equal"
                adjustable
                inputChangeDelay={500}
                updateFilters={updateFiltersHandler}
            />
        );

        const input = component.find("input");
        input.simulate("change", { target: { value: "test" } });

        jest.advanceTimersByTime(500);

        expect(updateFiltersHandler).toBeCalled();
    });

    it("debounces calls for updateFilters when value changes with numbers", () => {
        const updateFiltersHandler = jest.fn();
        const component = mount(
            <FilterComponent
                initialFilterType="equal"
                adjustable
                inputChangeDelay={500}
                updateFilters={updateFiltersHandler}
            />
        );

        expect(updateFiltersHandler).toBeCalledTimes(0);

        const input = component.find("input");
        input.simulate("change", { target: { value: "0" } });
        jest.advanceTimersByTime(499);
        input.simulate("change", { target: { value: "1" } });
        input.simulate("change", { target: { value: "2" } });
        jest.advanceTimersByTime(500);

        expect(updateFiltersHandler).toBeCalledTimes(1);

        input.simulate("change", { target: { value: "3" } });
        jest.advanceTimersByTime(500);

        expect(updateFiltersHandler).toBeCalledTimes(2);
    });

    it("debounces calls for updateFilters when value changes with decimals", () => {
        const updateFiltersHandler = jest.fn();
        const component = mount(
            <FilterComponent
                adjustable
                initialFilterType="equal"
                inputChangeDelay={500}
                updateFilters={updateFiltersHandler}
            />
        );

        expect(updateFiltersHandler).toBeCalledTimes(0);

        const input = component.find("input");
        input.simulate("change", { target: { value: "0.0" } });
        jest.advanceTimersByTime(499);
        input.simulate("change", { target: { value: "1.7" } });
        input.simulate("change", { target: { value: "4" } });
        jest.advanceTimersByTime(500);

        expect(updateFiltersHandler).toBeCalledTimes(1);

        input.simulate("change", { target: { value: "6.8" } });
        jest.advanceTimersByTime(500);

        expect(updateFiltersHandler).toBeCalledTimes(2);
    });

    it("debounces calls for updateFilters when value changes with invalid input", () => {
        const updateFiltersHandler = jest.fn();
        const component = mount(
            <FilterComponent
                adjustable
                initialFilterType="equal"
                inputChangeDelay={500}
                updateFilters={updateFiltersHandler}
            />
        );

        expect(updateFiltersHandler).toBeCalledTimes(0);

        const input = component.find("input");
        input.simulate("change", { target: { value: "test1" } });
        jest.advanceTimersByTime(499);
        input.simulate("change", { target: { value: "test2" } });
        input.simulate("change", { target: { value: "test3" } });
        jest.advanceTimersByTime(500);

        expect(updateFiltersHandler).toBeCalledTimes(1);
        expect(updateFiltersHandler).toHaveBeenLastCalledWith(undefined, "equal");

        input.simulate("change", { target: { value: "test4" } });
        jest.advanceTimersByTime(500);

        expect(updateFiltersHandler).toBeCalledTimes(2);
        expect(updateFiltersHandler).toHaveBeenLastCalledWith(undefined, "equal");
    });
});
