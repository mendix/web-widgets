import "@testing-library/jest-dom";
import { render, RenderResult } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
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
    defaultFilter: "contains",
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

    it("calls onChange when input value changes", async () => {
        const onChange = jest.fn();
        const { user, getByRole } = setup(<FilterComponent {...commonProps} onChange={onChange} />);

        const input = getByRole("textbox");
        await user.type(input, "test");
        expect(onChange).toHaveBeenCalledTimes(0);
        jest.advanceTimersByTime(500);
        expect(onChange).toHaveBeenCalledTimes(1);
    });

    it("debounces onChange calls when input value changes", async () => {
        const onChange = jest.fn();
        const { user, getByRole } = setup(<FilterComponent {...commonProps} onChange={onChange} />);

        expect(onChange).toHaveBeenCalledTimes(0);

        const input = getByRole("textbox");
        await user.type(input, "test");
        jest.advanceTimersByTime(499);
        expect(onChange).toHaveBeenCalledTimes(0);

        await user.clear(input);
        await user.type(input, "test2");
        await user.clear(input);
        await user.type(input, "test3");
        jest.advanceTimersByTime(500);
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith("test3", "contains");

        await user.clear(input);
        await user.type(input, "foo");
        jest.advanceTimersByTime(500);

        expect(onChange).toHaveBeenCalledTimes(2);
        expect(onChange).toHaveBeenCalledWith("foo", "contains");
    });
});
