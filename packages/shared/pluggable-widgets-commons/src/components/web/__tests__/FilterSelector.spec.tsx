import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { createElement } from "react";
import { FilterSelector } from "../FilterSelector";

const options = [
    { value: "contains", label: "Contains" },
    { value: "startsWith", label: "Starts with" },
    { value: "endsWith", label: "Ends with" },
    { value: "greater", label: "Greater than" },
    { value: "greaterEqual", label: "Greater than or equal" },
    { value: "equal", label: "Equal" },
    { value: "notEqual", label: "Not equal" },
    { value: "smaller", label: "Smaller than" },
    { value: "smallerEqual", label: "Smaller than or equal" }
];

jest.mock("../usePositionObserver", () => ({
    usePositionObserver: jest.fn((): DOMRect => ({ bottom: 0, right: 0 } as DOMRect))
}));

jest.useFakeTimers();

describe("Filter selector", () => {
    it("renders correctly", () => {
        const component = render(
            <FilterSelector defaultFilter="contains" onChange={jest.fn()} id="test" options={options} />
        );

        expect(component.asFragment()).toMatchSnapshot();
    });

    it("renders correctly with filter selectors open", async () => {
        const onChange = jest.fn();
        const component = render(
            <FilterSelector defaultFilter="contains" onChange={onChange} id="test" options={options} />
        );

        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
        await user.click(screen.getByRole("button"));
        jest.runOnlyPendingTimers();

        expect(component.baseElement).toMatchSnapshot();
    });

    it("renders correctly with aria-label", () => {
        const component = render(
            <FilterSelector
                ariaLabel="my label"
                defaultFilter="contains"
                onChange={jest.fn()}
                id="test"
                options={options}
            />
        );

        expect(component.asFragment()).toMatchSnapshot();
    });

    it("renders correctly with another default filter", () => {
        const component = render(
            <FilterSelector defaultFilter="equal" onChange={jest.fn()} id="test" options={options} />
        );

        expect(component.asFragment()).toMatchSnapshot();
    });

    it("calls onChange when type changes", async () => {
        const onChange = jest.fn();
        render(<FilterSelector defaultFilter="contains" onChange={onChange} id="test" options={options} />);

        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
        await user.click(screen.getByRole("button"));
        jest.runOnlyPendingTimers();

        const item0 = screen.getAllByRole("menuitem")[0];
        expect(item0).toBeDefined();
        await user.click(item0!);
        jest.runOnlyPendingTimers();

        expect(onChange).toBeCalled();
        expect(onChange).toBeCalledWith("contains");

        await user.click(screen.getByRole("button"));
        jest.runOnlyPendingTimers();

        const item1 = screen.getAllByRole("menuitem")[1];
        expect(item1).toBeDefined();
        await user.click(item1!);
        jest.runOnlyPendingTimers();

        expect(onChange).toBeCalledWith("startsWith");
    });

    describe("focus", () => {
        beforeEach(() => (document.body.innerHTML = ""));

        it("changes focused element when pressing filter selector button", async () => {
            render(<FilterSelector defaultFilter="contains" onChange={jest.fn()} id="test" options={options} />);

            expect(document.body).toHaveFocus();

            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
            await user.click(screen.getByRole("button"));
            jest.runOnlyPendingTimers();

            const items = screen.getAllByRole("menuitem");

            expect(items[0]).toHaveFocus();
        });

        it("changes focused element back to the button when pressing shift+tab in the first element", async () => {
            render(<FilterSelector defaultFilter="contains" onChange={jest.fn()} id="test" options={options} />);

            expect(document.body).toHaveFocus();

            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
            await user.click(screen.getByRole("button"));
            jest.runOnlyPendingTimers();

            const items = screen.getAllByRole("menuitem");
            expect(items[0]).toHaveFocus();

            await user.tab({ shift: true });
            jest.runOnlyPendingTimers();

            expect(screen.getByRole("button")).toHaveFocus();
        });

        it("triggers onChange with previous value when pressing tab on the last item", async () => {
            const onChange = jest.fn();

            render(
                <FilterSelector
                    defaultFilter="contains"
                    onChange={onChange}
                    id="test"
                    options={[
                        { value: "contains", label: "Contains" },
                        { value: "startsWith", label: "Starts with" }
                    ]}
                />
            );

            expect(document.body).toHaveFocus();

            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
            await user.click(screen.getByRole("button"));
            jest.runOnlyPendingTimers();

            const items = screen.getAllByRole("menuitem");
            expect(items[0]).toHaveFocus();

            await user.tab();
            expect(items[1]).toHaveFocus();
            await user.tab();

            jest.runOnlyPendingTimers();

            expect(onChange).toHaveBeenCalledWith("contains");
        });

        it("changes focused element back to the button when pressing escape in any element", async () => {
            render(<FilterSelector defaultFilter="contains" onChange={jest.fn()} id="test" options={options} />);

            expect(document.body).toHaveFocus();

            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
            await user.click(screen.getByRole("button"));
            jest.runOnlyPendingTimers();

            const items = screen.getAllByRole("menuitem");
            expect(items[0]).toHaveFocus();

            await user.tab();

            expect(items[1]).toHaveFocus();

            await user.keyboard("{Escape}");
            jest.runOnlyPendingTimers();

            expect(screen.getByRole("button")).toHaveFocus();
        });
    });
});
