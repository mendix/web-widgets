import { render, mount } from "enzyme";
import { createElement } from "react";
import { FilterComponent } from "../FilterComponent";

jest.useFakeTimers();

describe("Filter component", () => {
    it("renders correctly", () => {
        const component = render(<FilterComponent adjustable initialFilterType="contains" inputChangeDelay={500} />);

        expect(component).toMatchSnapshot();
    });

    it("renders correctly when not adjustable by user", () => {
        const component = render(
            <FilterComponent adjustable={false} initialFilterType="contains" inputChangeDelay={500} />
        );

        expect(component).toMatchSnapshot();
    });

    it("renders correctly with aria labels", () => {
        const component = render(
            <FilterComponent
                adjustable
                screenReaderButtonCaption="my label"
                screenReaderInputCaption="my label"
                initialFilterType="contains"
                inputChangeDelay={500}
            />
        );

        expect(component).toMatchSnapshot();
    });

    it("calls updateFilters when value changes", () => {
        const updateFiltersHandler = jest.fn();
        const component = mount(
            <FilterComponent
                adjustable
                initialFilterType="contains"
                inputChangeDelay={500}
                updateFilters={updateFiltersHandler}
            />
        );

        const input = component.find("input");
        input.simulate("change", { target: { value: "test" } });
        expect(updateFiltersHandler).toBeCalledTimes(0);
        jest.advanceTimersByTime(500);
        expect(updateFiltersHandler).toBeCalledTimes(1);
    });

    it("debounces calls for updateFilters when value changes", () => {
        const updateFiltersHandler = jest.fn();
        const component = mount(
            <FilterComponent
                adjustable
                initialFilterType="contains"
                inputChangeDelay={500}
                updateFilters={updateFiltersHandler}
            />
        );

        expect(updateFiltersHandler).toBeCalledTimes(0);

        const input = component.find("input");
        input.simulate("change", { target: { value: "test" } });
        jest.advanceTimersByTime(499);
        expect(updateFiltersHandler).toBeCalledTimes(0);

        input.simulate("change", { target: { value: "test2" } });
        input.simulate("change", { target: { value: "test3" } });
        jest.advanceTimersByTime(500);
        expect(updateFiltersHandler).toBeCalledTimes(1);
        expect(updateFiltersHandler).toHaveBeenCalledWith("test3", "contains");

        input.simulate("change", { target: { value: "test" } });
        jest.advanceTimersByTime(500);

        expect(updateFiltersHandler).toBeCalledTimes(2);
        expect(updateFiltersHandler).toHaveBeenCalledWith("test", "contains");
    });
});
