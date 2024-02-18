import "@testing-library/jest-dom";
import { createElement } from "react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { render, RenderResult } from "@testing-library/react";
import { FilterComponent } from "../FilterComponent";
import { FilterComponentProps } from "../typings";
import Big from "big.js";

jest.useFakeTimers();

function setup(jsx: React.ReactElement): { user: UserEvent } & RenderResult {
    return {
        user: userEvent.setup({
            advanceTimers: jest.advanceTimersByTime
        }),
        ...render(jsx)
    };
}

describe("Filter component", () => {
    it("renders correctly", () => {
        const component = render(
            <FilterComponent adjustable defaultFilterType="equal" inputChangeDelay={500} name="Name" />
        );

        expect(component.container.firstChild).toMatchSnapshot();
    });

    it("renders correctly when not adjustable by user", () => {
        const component = render(
            <FilterComponent adjustable={false} defaultFilterType="equal" inputChangeDelay={500} name="Name" />
        );

        expect(component.container.firstChild).toMatchSnapshot();
    });

    it("renders correctly with aria labels", () => {
        const component = render(
            <FilterComponent
                adjustable
                defaultFilterType="equal"
                inputChangeDelay={500}
                screenReaderButtonCaption="my label"
                screenReaderInputCaption="my label"
                name="Name"
            />
        );

        expect(component.container.firstChild).toMatchSnapshot();
    });

    it("calls updateFilters when input value changes", async () => {
        const updateFiltersHandler: jest.Mock<FilterComponentProps["updateFilters"]> = jest.fn();
        const { user, getByRole } = setup(
            <FilterComponent
                defaultFilterType="equal"
                adjustable
                inputChangeDelay={500}
                updateFilters={updateFiltersHandler}
                name="Name"
            />
        );

        const input = getByRole("spinbutton");
        await user.type(input, "42");
        jest.advanceTimersByTime(500);
        expect(updateFiltersHandler).toHaveBeenCalledTimes(1);
        const [value] = updateFiltersHandler.mock.lastCall;
        expect(value).toBeInstanceOf(Big);
        expect(value.toNumber()).toEqual(42);
    });

    it("debounces calls for updateFilters when value changes with integer", async () => {
        const updateFiltersHandler = jest.fn();
        const { user, getByRole } = setup(
            <FilterComponent
                defaultFilterType="equal"
                adjustable
                inputChangeDelay={500}
                updateFilters={updateFiltersHandler}
                name="Name"
            />
        );

        expect(updateFiltersHandler).toHaveBeenCalledTimes(0);

        const input = getByRole("spinbutton");
        await user.type(input, "42");
        jest.advanceTimersByTime(499);
        expect(updateFiltersHandler).toHaveBeenCalledTimes(0);

        await user.clear(input);
        await user.type(input, "32");
        jest.advanceTimersByTime(499);
        expect(updateFiltersHandler).toHaveBeenCalledTimes(0);

        await user.clear(input);
        await user.type(input, "22");
        jest.advanceTimersByTime(500);
        expect(updateFiltersHandler).toHaveBeenCalledTimes(1);
        const [value] = updateFiltersHandler.mock.lastCall;
        expect(value).toBeInstanceOf(Big);
        expect(value.toNumber()).toEqual(22);
    });

    it("debounces calls for updateFilters when value changes with decimals", async () => {
        const updateFiltersHandler = jest.fn();
        const { user, getByRole } = setup(
            <FilterComponent
                defaultFilterType="equal"
                adjustable
                inputChangeDelay={500}
                updateFilters={updateFiltersHandler}
                name="Name"
            />
        );

        expect(updateFiltersHandler).toHaveBeenCalledTimes(0);

        const input = getByRole("spinbutton");
        await user.type(input, "2.200102");
        jest.advanceTimersByTime(499);
        expect(updateFiltersHandler).toHaveBeenCalledTimes(0);

        await user.clear(input);
        await user.type(input, "3.294234");
        jest.advanceTimersByTime(499);
        expect(updateFiltersHandler).toHaveBeenCalledTimes(0);

        await user.clear(input);
        await user.type(input, "5.000001");
        jest.advanceTimersByTime(500);
        expect(updateFiltersHandler).toHaveBeenCalledTimes(1);
        const [value] = updateFiltersHandler.mock.lastCall;
        expect(value).toBeInstanceOf(Big);
        expect(value.toNumber()).toEqual(5.000001);
    });

    it("debounces calls for updateFilters when value is cleared", async () => {
        const updateFiltersHandler = jest.fn();
        const { user, getByRole } = setup(
            <FilterComponent
                defaultFilterType="equal"
                adjustable
                inputChangeDelay={500}
                updateFilters={updateFiltersHandler}
                name="Name"
            />
        );

        expect(updateFiltersHandler).toHaveBeenCalledTimes(0);

        const input = getByRole("spinbutton");
        await user.type(input, "42");
        jest.advanceTimersByTime(500);
        expect(updateFiltersHandler).toHaveBeenCalledTimes(1);
        let value;
        [value] = updateFiltersHandler.mock.lastCall;
        expect(input).toHaveValue(42);
        expect(value).toBeInstanceOf(Big);
        expect(value.toNumber()).toEqual(42);

        await user.clear(input);

        jest.advanceTimersByTime(499);
        expect(updateFiltersHandler).toHaveBeenCalledTimes(1);

        jest.advanceTimersByTime(1);
        [value] = updateFiltersHandler.mock.lastCall;
        expect(input).toHaveValue(null);
        expect(value).toBe(undefined);
    });
});
