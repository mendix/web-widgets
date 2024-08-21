import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createElement } from "react";
import { SortComponent, SortOption } from "../SortComponent";

const defaultOptions: SortOption[] = [
    { caption: "Empty option", value: null },
    { caption: "1", value: "_1" },
    { caption: "2", value: "_2" },
    { caption: "3", value: "_3" }
];

jest.useFakeTimers();

describe("Sort selector", () => {
    describe("renders correctly", () => {
        it("with options", () => {
            const component = render(<SortComponent options={defaultOptions} direction="asc" value={null} />);

            expect(component.container).toMatchSnapshot();
        });

        it("with no options", () => {
            const component = render(<SortComponent options={[]} direction="asc" value={null} />);

            expect(component.container).toMatchSnapshot();
        });

        it("with a11y properties", () => {
            const component = render(
                <SortComponent
                    options={defaultOptions}
                    direction="asc"
                    value={null}
                    screenReaderButtonCaption="my button"
                    screenReaderInputCaption="my input"
                />
            );

            expect(component.container).toMatchSnapshot();
        });

        it("with placeholder", () => {
            const component = render(
                <SortComponent options={defaultOptions} placeholder={"find me"} direction="asc" value={null} />
            );

            expect(component.container).toMatchSnapshot();
            expect(component.asFragment().querySelector("input")?.getAttribute("placeholder")).toBe("find me");
        });
    });

    it("selects default option", () => {
        const defaultOption = defaultOptions[1];
        const { asFragment } = render(
            <SortComponent options={defaultOptions} value={defaultOption.value} direction="asc" />
        );
        expect(asFragment().querySelector("input")?.getAttribute("value")).toBe(defaultOption.caption);
    });

    describe("when value changes", () => {
        it("calls onSelect when value changes", async () => {
            const onSelectHandler = jest.fn();
            const component = render(
                <SortComponent
                    placeholder="TestInput"
                    options={defaultOptions}
                    onSelect={onSelectHandler}
                    direction="asc"
                    value={null}
                />
            );

            const input = component.container.querySelector("input");
            await fireEvent.click(input as Element);

            const items = component.queryAllByRole("menuitem");
            await fireEvent.click(items[0]);

            expect(onSelectHandler).toHaveBeenCalled();
        });

        it("shows selected option on input value", async () => {
            let defaultOption = defaultOptions[1];
            const component = render(
                <SortComponent
                    options={defaultOptions}
                    value={defaultOption.value}
                    direction="asc"
                    onSelect={option => (defaultOption = option)}
                />
            );

            const input = component.container.querySelector("input");
            fireEvent.click(input as Element);

            expect(input?.getAttribute("value")).toBe(defaultOption.caption);

            const item = component.queryAllByRole("menuitem")[defaultOptions.length - 1];
            fireEvent.click(item);

            component.rerender(
                <SortComponent
                    options={defaultOptions}
                    value={defaultOption.value}
                    direction="asc"
                    onSelect={option => (defaultOption = option)}
                />
            );
            expect(component.container.querySelector("input")?.getAttribute("value")).toBe(defaultOptions[3].caption);
        });
    });

    describe("focus", () => {
        it("changes focused element when pressing the input", async () => {
            render(<SortComponent options={defaultOptions} placeholder="Click me" direction="asc" value={null} />);
            expect(document.body).toHaveFocus();
            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

            const input = screen.getByPlaceholderText("Click me");
            expect(input).toBeDefined();

            await user.click(input);

            jest.runOnlyPendingTimers();

            const items = screen.queryAllByRole("menuitem");
            expect(items[0]).toHaveFocus();
        });

        it("changes focused element back to the input when pressing shift+tab in the first element", async () => {
            render(<SortComponent options={defaultOptions} placeholder="Click me" direction="asc" value={null} />);
            expect(document.body).toHaveFocus();
            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

            const input = screen.getByPlaceholderText("Click me");
            expect(input).toBeDefined();
            await user.click(input);

            jest.runOnlyPendingTimers();

            const items = screen.getAllByRole("menuitem");
            expect(items[0]).toHaveFocus();

            await user.tab({ shift: true });

            jest.runOnlyPendingTimers();

            expect(input).toHaveFocus();
        });

        it("changes focused element back to the input when pressing tab on the last item", async () => {
            render(
                <SortComponent
                    options={[
                        { caption: "Click me", value: null },
                        { caption: "1", value: "_1" }
                    ]}
                    placeholder="Click me"
                    direction="asc"
                    value={null}
                />
            );

            expect(document.body).toHaveFocus();
            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

            const input = screen.getByPlaceholderText("Click me");
            await user.click(input);

            jest.runOnlyPendingTimers();

            const items = screen.getAllByRole("menuitem");
            expect(items[0]).toHaveFocus();

            await user.tab();
            expect(items[1]).toHaveFocus();
            await user.tab();

            jest.runOnlyPendingTimers();

            const button = screen.getByRole("button");

            expect(button).toHaveFocus();
        });

        it("changes focused element back to the input when pressing escape on any item", async () => {
            render(
                <SortComponent
                    options={[
                        { caption: "Click me", value: null },
                        { caption: "1", value: "_1" },
                        { caption: "2", value: "_2" }
                    ]}
                    placeholder="Click me"
                    direction="asc"
                    value={null}
                />
            );
            expect(document.body).toHaveFocus();
            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

            const input = screen.getByPlaceholderText("Click me");
            await user.click(input);
            jest.runOnlyPendingTimers();

            const items = screen.getAllByRole("menuitem");
            expect(items).toHaveLength(3);
            expect(items[0]).toHaveFocus();

            await user.tab();

            expect(items[1]).toHaveFocus();

            await user.keyboard("{Escape}");

            jest.runOnlyPendingTimers();

            expect(input).toHaveFocus();
        });
    });
});
