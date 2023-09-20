import { createElement } from "react";
import { FilterComponent } from "../FilterComponent";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

const defaultOptions = [
    { caption: "1", value: "_1" },
    { caption: "2", value: "_2" },
    { caption: "3", value: "_3" }
];

jest.useFakeTimers();

describe("FilterComponent", () => {
    describe("with single selection", () => {
        describe("renders correctly", () => {
            it("with options", () => {
                const { asFragment } = render(<FilterComponent options={defaultOptions} />);

                expect(asFragment()).toMatchSnapshot();
            });
            it("with no options", () => {
                const { asFragment } = render(<FilterComponent options={[]} />);

                expect(asFragment()).toMatchSnapshot();
            });
            it("with ariaLabel", () => {
                const { asFragment } = render(<FilterComponent options={defaultOptions} ariaLabel="my label" />);

                expect(asFragment()).toMatchSnapshot();
            });
            it("with emptyOptionCaption", () => {
                const { asFragment } = render(
                    <FilterComponent options={defaultOptions} emptyOptionCaption={"find me"} />
                );

                expect(asFragment()).toMatchSnapshot();
                screen.getByPlaceholderText("find me");
            });
        });

        it("selects default option", () => {
            const updateFilters = jest.fn();
            const defaultOption = defaultOptions[0];

            render(
                <FilterComponent
                    options={defaultOptions}
                    updateFilters={updateFilters}
                    initialSelected={defaultOption.value}
                />
            );

            const [input] = screen.getAllByRole("textbox");

            expect(input).toHaveValue(defaultOption.caption);
            expect(updateFilters).toBeCalledTimes(1);
            expect(updateFilters).toHaveBeenLastCalledWith([defaultOption]);
        });

        it("don't call updateFilters when nothing is selected and 'empty' option clicked", async () => {
            const updateFilters = jest.fn();

            render(<FilterComponent options={defaultOptions} updateFilters={updateFilters} />);

            expect(updateFilters).toBeCalledTimes(1);

            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

            const [input] = screen.getAllByRole("textbox");

            await user.click(input);

            const menuItems = screen.getAllByRole("menuitem");

            await user.click(menuItems[0]);

            expect(updateFilters).toBeCalledTimes(1);
            expect(updateFilters).toHaveBeenLastCalledWith([]);
        });

        describe("when value changes", () => {
            it("calls updateFilters when value changes", async () => {
                const updateFilters = jest.fn();

                render(<FilterComponent options={defaultOptions} updateFilters={updateFilters} />);

                expect(updateFilters).toBeCalledTimes(1);

                const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
                const [input] = screen.getAllByRole("textbox");

                await user.click(input);
                let menuItems = screen.getAllByRole("menuitem");
                // click "1"
                await user.click(menuItems[1]);
                expect(updateFilters).toBeCalledTimes(2);
                expect(updateFilters).toHaveBeenLastCalledWith([{ caption: "1", value: "_1" }]);

                await user.click(input);
                menuItems = screen.getAllByRole("menuitem");
                // click empty
                await user.click(menuItems[0]);
                expect(updateFilters).toBeCalledTimes(3);
                expect(updateFilters).toHaveBeenLastCalledWith([]);

                await user.click(input);
                menuItems = screen.getAllByRole("menuitem");
                // click "3"
                await user.click(menuItems[3]);
                expect(updateFilters).toBeCalledTimes(4);
                expect(updateFilters).toHaveBeenLastCalledWith([{ caption: "3", value: "_3" }]);
            });

            it("shows selected option on input value", async () => {
                render(
                    <FilterComponent
                        options={[
                            { caption: "Apple", value: "Foo" },
                            { caption: "Banana", value: "bar" }
                        ]}
                        initialSelected="Foo"
                    />
                );

                const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
                const [input] = screen.getAllByRole("textbox");

                expect(input).toHaveValue("Apple");

                await user.click(input);
                const menuItems = screen.getAllByRole("menuitem");
                // click "2"
                await user.click(menuItems[2]);

                expect(input).toHaveValue("Banana");
            });
        });
    });

    describe("with multi selection", () => {
        describe("renders correctly", () => {
            it("with options", () => {
                const { asFragment } = render(<FilterComponent multiSelect options={defaultOptions} />);

                expect(asFragment()).toMatchSnapshot();
            });
            it("with no options", () => {
                const { asFragment } = render(<FilterComponent multiSelect options={[]} />);

                expect(asFragment()).toMatchSnapshot();
            });
            it("with ariaLabel", () => {
                const { asFragment } = render(
                    <FilterComponent options={defaultOptions} multiSelect ariaLabel="my label" />
                );

                expect(asFragment()).toMatchSnapshot();
            });
            it("with emptyOptionCaption", () => {
                const { asFragment } = render(
                    <FilterComponent multiSelect options={defaultOptions} emptyOptionCaption={"find me multi"} />
                );

                expect(asFragment()).toMatchSnapshot();
                screen.getByPlaceholderText("find me multi");
            });
        });

        describe("with default options set", () => {
            it("selects multiple default options", () => {
                const updateFilters = jest.fn();
                const [option1, option2] = defaultOptions;
                const defaultValue = `${option1.value},${option2.value}`;

                render(
                    <FilterComponent
                        options={defaultOptions}
                        initialSelected={defaultValue}
                        updateFilters={updateFilters}
                    />
                );

                const [input] = screen.getAllByRole("textbox");
                const expectedCaptions = `${option1.caption},${option2.caption}`;
                expect(input.getAttribute("value")).toBe(expectedCaptions);
                expect(updateFilters).toBeCalledTimes(1);
                expect(updateFilters).toHaveBeenLastCalledWith([option1, option2]);
            });

            it("filters incorrect default options", () => {
                render(<FilterComponent options={defaultOptions} initialSelected="_1,_2,SomeRandomText" multiSelect />);

                const [input] = screen.getAllByRole("textbox");

                const expectedCaptions = `1,2`;
                expect(input).toHaveValue(expectedCaptions);
            });
        });

        describe("when value changes", () => {
            it("calls updateFilters when value changes", async () => {
                const updateFilters = jest.fn();

                render(<FilterComponent options={defaultOptions} updateFilters={updateFilters} multiSelect />);

                const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
                const [input] = screen.getAllByRole("textbox");

                await user.click(input);
                const [item1, item2] = screen.getAllByRole("menuitem");
                // select "1"
                await user.click(item1);
                expect(updateFilters).toBeCalledTimes(2);
                expect(updateFilters).toHaveBeenLastCalledWith([{ caption: "1", value: "_1" }]);

                // select "2"
                await user.click(item2);
                expect(updateFilters).toBeCalledTimes(3);
                expect(updateFilters).toHaveBeenLastCalledWith([
                    { caption: "1", value: "_1" },
                    { caption: "2", value: "_2" }
                ]);

                // unselect "2"
                await user.click(item2);
                expect(updateFilters).toBeCalledTimes(4);
                expect(updateFilters).toHaveBeenLastCalledWith([{ caption: "1", value: "_1" }]);
            });
            it("shows selected options on input value", async () => {
                render(
                    <FilterComponent
                        options={[
                            { caption: "Apple", value: "Foo" },
                            { caption: "Banana", value: "bar" }
                        ]}
                        multiSelect
                    />
                );

                const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
                const [input] = screen.getAllByRole("textbox");

                expect(input).toHaveValue("");

                await user.click(input);
                // click "Apple"
                await user.click(screen.getAllByRole("menuitem")[0]);

                expect(input).toHaveValue("Apple");

                // click "Banana"
                await user.click(screen.getAllByRole("menuitem")[1]);

                expect(input).toHaveValue("Apple,Banana");
            });
        });

        it("keep menu open when item is clicked", async () => {
            render(
                <FilterComponent
                    options={[
                        { caption: "Alice", value: "1" },
                        { caption: "Bob", value: "2" },
                        { caption: "Chris", value: "3" }
                    ]}
                    multiSelect
                />
            );

            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
            const input = screen.getByRole("textbox");
            await user.click(input);
            const menu = screen.getByRole("menu");
            const [alice, bob, chris] = screen.getAllByRole("menuitem");
            await user.click(alice);
            expect(menu).toBeVisible();
            await user.click(bob);
            expect(menu).toBeVisible();
            await user.click(chris);
            expect(menu).toBeVisible();
        });
    });

    describe("focus", () => {
        it("changes focused element when pressing the input", async () => {
            render(<FilterComponent options={defaultOptions} emptyOptionCaption="Click me" />);
            expect(document.body).toHaveFocus();

            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

            const input = screen.getByPlaceholderText("Click me");
            await user.click(input);

            jest.runOnlyPendingTimers();

            const items = screen.getAllByRole("menuitem");
            expect(items[0]).toHaveFocus();
        });

        it("changes focused element back to the input when pressing shift+tab in the first element", async () => {
            render(<FilterComponent options={defaultOptions} emptyOptionCaption="Click me" />);
            expect(document.body).toHaveFocus();

            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

            const input = screen.getByPlaceholderText("Click me");

            await user.click(input);

            jest.runOnlyPendingTimers();

            const items = screen.getAllByRole("menuitem");
            expect(items[0]).toHaveFocus();

            await user.tab({ shift: true });

            jest.runOnlyPendingTimers();

            expect(input).toHaveFocus();
        });

        it("changes focused element back to the input when pressing tab on the last item", async () => {
            render(<FilterComponent options={[{ caption: "1", value: "_1" }]} emptyOptionCaption="Click me" />);
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

            expect(input).toHaveFocus();
        });

        it("changes focused element back to the input when pressing escape on any item", async () => {
            render(
                <FilterComponent
                    options={[
                        { caption: "1", value: "_1" },
                        { caption: "2", value: "_2" }
                    ]}
                    emptyOptionCaption="Click me"
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
