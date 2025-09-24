import "@testing-library/jest-dom";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SortComponent } from "../SortComponent";

const defaultOptions: Array<{ caption: string; value: string }> = [
    { caption: "Empty option", value: "none" },
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
                    onSelect={optionValue => {
                        defaultOption = defaultOptions.find(opt => opt.value === optionValue) || defaultOption;
                    }}
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
                    onSelect={optionValue => {
                        defaultOption = defaultOptions.find(opt => opt.value === optionValue) || defaultOption;
                    }}
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

            // Wait for setTimeout(10ms) to execute the focus logic
            act(() => {
                jest.advanceTimersByTime(20);
            });

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

            // Wait for setTimeout(10ms) to execute the focus logic
            act(() => {
                jest.advanceTimersByTime(20);
            });

            const items = screen.getAllByRole("menuitem");
            expect(items[0]).toHaveFocus();

            await user.tab({ shift: true });

            // Wait for focus change
            act(() => {
                jest.advanceTimersByTime(20);
            });

            expect(input).toHaveFocus();
        });

        it("changes focused element back to the input when pressing tab on the last item", async () => {
            render(
                <SortComponent
                    options={[
                        { caption: "Click me", value: "click_me" },
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

            // Wait for setTimeout(10ms) to execute the focus logic
            act(() => {
                jest.advanceTimersByTime(20);
            });

            const items = screen.getAllByRole("menuitem");
            expect(items[0]).toHaveFocus();

            await user.tab();
            expect(items[1]).toHaveFocus();
            await user.tab();

            // Wait for focus change
            act(() => {
                jest.advanceTimersByTime(20);
            });

            const button = screen.getByRole("button");

            expect(button).toHaveFocus();
        });

        it("changes focused element back to the input when pressing escape on any item", async () => {
            render(
                <SortComponent
                    options={[
                        { caption: "Click me", value: "click_me" },
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

            // Wait for setTimeout(10ms) to execute the focus logic
            act(() => {
                jest.advanceTimersByTime(20);
            });

            const items = screen.getAllByRole("menuitem");
            expect(items).toHaveLength(3);
            expect(items[0]).toHaveFocus();

            await user.tab();

            expect(items[1]).toHaveFocus();

            await user.keyboard("{Escape}");

            // Wait for focus change
            act(() => {
                jest.advanceTimersByTime(20);
            });

            expect(input).toHaveFocus();
        });
    });
});
