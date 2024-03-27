import "@testing-library/jest-dom";
import { render, RenderResult } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import Big from "big.js";
import { createElement } from "react";
import { FilterComponent, FilterComponentProps } from "../FilterComponent";

jest.useFakeTimers();

function setup(jsx: React.ReactElement): { user: UserEvent } & RenderResult {
    return {
        user: userEvent.setup({
            advanceTimers: jest.advanceTimersByTime
        }),
        ...render(jsx)
    };
}

const commonProps: FilterComponentProps = {
    adjustable: true,
    defaultFilter: "equal",
    changeDelay: 500,
    name: "Name",
    value: undefined,
    onChange: () => {},
    parentChannelName: null
};

describe("Filter component", () => {
    it("renders correctly", () => {
        const component = render(<FilterComponent {...commonProps} />);

        expect(component.container.firstChild).toMatchSnapshot();
    });

    it("renders correctly when not adjustable by user", () => {
        const component = render(<FilterComponent {...commonProps} adjustable={false} />);

        expect(component.container.firstChild).toMatchSnapshot();
    });

    it("renders correctly with aria labels", () => {
        const component = render(
            <FilterComponent
                {...commonProps}
                screenReaderButtonCaption="my label"
                screenReaderInputCaption="my label"
            />
        );

        expect(component.container.firstChild).toMatchSnapshot();
    });

    it("calls updateFilters when input value changes", async () => {
        const onChange: jest.Mock<FilterComponentProps["onChange"]> = jest.fn();
        const { user, getByRole } = setup(<FilterComponent {...commonProps} onChange={onChange} />);

        const input = getByRole("spinbutton");
        await user.type(input, "42");
        jest.advanceTimersByTime(500);
        expect(onChange).toHaveBeenCalledTimes(1);
        const [value] = onChange.mock.lastCall;
        expect(value).toBeInstanceOf(Big);
        expect(value.toNumber()).toEqual(42);
    });

    it("debounces calls for updateFilters when value changes with integer", async () => {
        const onChange: jest.Mock<FilterComponentProps["onChange"]> = jest.fn();
        const { user, getByRole } = setup(<FilterComponent {...commonProps} onChange={onChange} />);

        expect(onChange).toHaveBeenCalledTimes(0);

        const input = getByRole("spinbutton");
        await user.type(input, "42");
        jest.advanceTimersByTime(499);
        expect(onChange).toHaveBeenCalledTimes(0);

        await user.clear(input);
        await user.type(input, "32");
        jest.advanceTimersByTime(499);
        expect(onChange).toHaveBeenCalledTimes(0);

        await user.clear(input);
        await user.type(input, "22");
        jest.advanceTimersByTime(500);
        expect(onChange).toHaveBeenCalledTimes(1);
        const [value] = onChange.mock.lastCall;
        expect(value).toBeInstanceOf(Big);
        expect(value.toNumber()).toEqual(22);
    });

    it("debounces calls for updateFilters when value changes with decimals", async () => {
        const onChange: jest.Mock<FilterComponentProps["onChange"]> = jest.fn();
        const { user, getByRole } = setup(<FilterComponent {...commonProps} onChange={onChange} />);
        expect(onChange).toHaveBeenCalledTimes(0);

        const input = getByRole("spinbutton");
        await user.type(input, "2.200102");
        jest.advanceTimersByTime(499);
        expect(onChange).toHaveBeenCalledTimes(0);

        await user.clear(input);
        await user.type(input, "3.294234");
        jest.advanceTimersByTime(499);
        expect(onChange).toHaveBeenCalledTimes(0);

        await user.clear(input);
        await user.type(input, "5.000001");
        jest.advanceTimersByTime(500);
        expect(onChange).toHaveBeenCalledTimes(1);
        const [value] = onChange.mock.lastCall;
        expect(value).toBeInstanceOf(Big);
        expect(value.toNumber()).toEqual(5.000001);
    });

    it("debounces calls for updateFilters when value is cleared", async () => {
        const onChange: jest.Mock<FilterComponentProps["onChange"]> = jest.fn();
        const { user, getByRole } = setup(<FilterComponent {...commonProps} onChange={onChange} />);

        expect(onChange).toHaveBeenCalledTimes(0);

        const input = getByRole("spinbutton");
        await user.type(input, "42");
        jest.advanceTimersByTime(500);
        expect(onChange).toHaveBeenCalledTimes(1);
        let value;
        [value] = onChange.mock.lastCall;
        expect(input).toHaveValue(42);
        expect(value).toBeInstanceOf(Big);
        expect(value.toNumber()).toEqual(42);

        await user.clear(input);

        jest.advanceTimersByTime(499);
        expect(onChange).toHaveBeenCalledTimes(1);

        jest.advanceTimersByTime(1);
        [value] = onChange.mock.lastCall;
        expect(input).toHaveValue(null);
        expect(value).toBe(undefined);
    });
});
