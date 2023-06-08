import { mount, render, shallow } from "enzyme";
import { createElement } from "react";
import { FilterComponent } from "../FilterComponent";
import { render as renderTestingLib, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

const defaultOptions = [
    { caption: "1", value: "_1" },
    { caption: "2", value: "_2" },
    { caption: "3", value: "_3" }
];

jest.mock("@mendix/pluggable-widgets-commons/dist/components/web", () => ({
    ...jest.requireActual("@mendix/pluggable-widgets-commons/dist/components/web"),
    usePositionObserver: jest.fn((): DOMRect => ({ bottom: 0, right: 0 } as DOMRect))
}));

jest.useFakeTimers();

describe("Filter selector", () => {
    describe("with single selection", () => {
        describe("renders correctly", () => {
            it("with options", () => {
                const component = render(<FilterComponent options={defaultOptions} />);

                expect(component).toMatchSnapshot();
            });
            it("with no options", () => {
                const component = render(<FilterComponent options={[]} />);

                expect(component).toMatchSnapshot();
            });
            it("with ariaLabel", () => {
                const component = render(<FilterComponent options={defaultOptions} ariaLabel="my label" />);

                expect(component).toMatchSnapshot();
            });
            it("with emptyOptioncaption", () => {
                const component = render(<FilterComponent options={defaultOptions} emptyOptionCaption={"find me"} />);

                expect(component).toMatchSnapshot();
                expect(component.find("input").first().prop("placeholder")).toBe("find me");
            });
        });
        it("selects default option", () => {
            const updateFilters = jest.fn();
            const defaultOption = defaultOptions[0];

            renderTestingLib(
                <FilterComponent
                    options={defaultOptions}
                    updateFilters={updateFilters}
                    initialSelected={defaultOption.value}
                />
            );

            const [input] = screen.getAllByRole("textbox");

            expect(input.getAttribute("value")).toBe(defaultOption.caption);
            expect(updateFilters).toBeCalledTimes(1);
            expect(updateFilters).toHaveBeenLastCalledWith([defaultOption]);
        });

        describe("when value changes", () => {
            it("calls updateFilters when value changes", () => {
                const onClickProps = { preventDefault: jest.fn(), stopPropagation: jest.fn() };
                const updateFilterHandler = jest.fn();
                const component = shallow(
                    <FilterComponent options={defaultOptions} updateFilters={updateFilterHandler} />
                );

                const input = component.find("input");
                input.simulate("click", onClickProps);

                const item = component.find("li").first();
                item.simulate("click", onClickProps);

                expect(updateFilterHandler).toBeCalled();
            });
            it("shows selected option on input value", () => {
                const onClickProps = { preventDefault: jest.fn(), stopPropagation: jest.fn() };
                const defaultOption = defaultOptions[1];
                const component = shallow(
                    <FilterComponent options={defaultOptions} initialSelected={defaultOption.value} />
                );

                const input = component.find("input");
                input.simulate("click", onClickProps);

                expect(component.find("input").first().prop("value")).toBe(defaultOption.caption);

                const item = component.find("li").last(); // [cap 3: val:_3]
                item.simulate("click", onClickProps);

                expect(component.find("input").first().prop("value")).toBe(defaultOptions[2].caption);
            });
        });
    });

    describe("with multi selection", () => {
        describe("renders correctly", () => {
            it("with options", () => {
                const component = render(<FilterComponent multiSelect options={defaultOptions} />);

                expect(component).toMatchSnapshot();
            });
            it("with no options", () => {
                const component = render(<FilterComponent multiSelect options={[]} />);

                expect(component).toMatchSnapshot();
            });
            it("with ariaLabel", () => {
                const component = render(<FilterComponent options={defaultOptions} multiSelect ariaLabel="my label" />);

                expect(component).toMatchSnapshot();
            });
            it("with emptyOptioncaption", () => {
                const component = render(
                    <FilterComponent multiSelect options={defaultOptions} emptyOptionCaption={"find me"} />
                );

                expect(component).toMatchSnapshot();
                expect(component.find("input").first().prop("placeholder")).toBe("find me");
            });
        });

        describe("with default options set", () => {
            it("selects multiple default options", () => {
                const updateFilters = jest.fn();
                const [option1, option2] = defaultOptions;
                const defaultValue = `${option1.value},${option2.value}`;

                renderTestingLib(
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
                const inCorrectDefaultValue = `${defaultOptions[0].value},${defaultOptions[1].value},SomeRandomText`;

                const component = shallow(
                    <FilterComponent multiSelect options={defaultOptions} initialSelected={inCorrectDefaultValue} />
                );

                const input = component.find("input").first();

                const expectedCaptions = `${defaultOptions[0].caption},${defaultOptions[1].caption}`;
                expect(input.prop("value")).toBe(expectedCaptions);
            });
        });

        describe("when value changes", () => {
            it("calls updateFilters when value changes", () => {
                const onClickProps = { preventDefault: jest.fn(), stopPropagation: jest.fn() };
                const updateFiltersHandler = jest.fn();
                const component = mount(
                    <FilterComponent multiSelect options={defaultOptions} updateFilters={updateFiltersHandler} />
                );

                const input = component.find("input");
                input.simulate("click", onClickProps);

                const item = component.find("li").first();
                item.simulate("click", onClickProps);

                expect(updateFiltersHandler).toBeCalled();
            });
            it("shows selected options on input value", () => {
                const onClickProps = { preventDefault: jest.fn(), stopPropagation: jest.fn() };
                const component = mount(<FilterComponent multiSelect options={defaultOptions} />);

                const input = component.find("input");
                input.simulate("click", onClickProps);

                const item = component.find("li").at(1);
                item.simulate("click", onClickProps);
                const item2 = component.find("li").at(2);
                item2.simulate("click", onClickProps);

                expect(component.find("input").first().prop("value")).toBe("2,3");
            });
        });
    });

    describe("focus", () => {
        it.skip("changes focused element when pressing the input", async () => {
            renderTestingLib(<FilterComponent options={defaultOptions} emptyOptionCaption="Click me" />);
            expect(document.body).toHaveFocus();

            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

            const input = screen.getByPlaceholderText("Click me");
            await user.click(input);

            jest.runOnlyPendingTimers();

            const items = screen.getAllByRole("menuitem");
            expect(items[0]).toHaveFocus();
        });

        it.skip("changes focused element back to the input when pressing shift+tab in the first element", async () => {
            renderTestingLib(<FilterComponent options={defaultOptions} emptyOptionCaption="Click me" />);
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

        it.skip("changes focused element back to the input when pressing tab on the last item", async () => {
            renderTestingLib(
                <FilterComponent options={[{ caption: "1", value: "_1" }]} emptyOptionCaption="Click me" />
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

            expect(input).toHaveFocus();
        });

        it.skip("changes focused element back to the input when pressing escape on any item", async () => {
            renderTestingLib(
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
