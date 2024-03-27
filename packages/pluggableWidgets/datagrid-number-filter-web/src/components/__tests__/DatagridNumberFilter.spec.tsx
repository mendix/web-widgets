import "@testing-library/jest-dom";
import { FilterContextValue } from "@mendix/widget-plugin-filtering";
import {
    actionValue,
    dynamicValue,
    EditableValueBuilder,
    ListAttributeValueBuilder
} from "@mendix/widget-plugin-test-utils";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createContext, createElement } from "react";

import DatagridNumberFilter from "../../DatagridNumberFilter";
import { Big } from "big.js";
import { deletePlugin, requirePlugin } from "@mendix/widget-plugin-external-events/plugin";
const commonProps = {
    class: "filter-custom-class",
    tabIndex: 0,
    name: "filter-test",
    defaultFilter: "equal" as const,
    adjustable: true,
    advanced: false,
    delay: 1000
};

jest.useFakeTimers();

describe("Number Filter", () => {
    describe("with single instance", () => {
        afterEach(() => {
            delete (global as any)["com.mendix.widgets.web.UUID"];
        });

        describe("with single attribute", () => {
            beforeAll(() => {
                (window as any)["com.mendix.widgets.web.filterable.filterContext"] = createContext({
                    filterDispatcher: jest.fn(),
                    singleAttribute: new ListAttributeValueBuilder().withType("Long").withFilterable(true).build()
                } as FilterContextValue);
            });

            it("renders correctly", () => {
                const { asFragment } = render(<DatagridNumberFilter {...commonProps} />);

                expect(asFragment()).toMatchSnapshot();
            });

            it("triggers attribute and onchange action on change filter value", async () => {
                const action = actionValue();
                const attribute = new EditableValueBuilder<Big>().build();
                render(<DatagridNumberFilter {...commonProps} onChange={action} valueAttribute={attribute} />);

                const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

                await user.type(screen.getByRole("spinbutton"), "10");

                jest.runOnlyPendingTimers();

                expect(action.execute).toBeCalledTimes(1);
                expect(attribute.setValue).toBeCalledWith(new Big(10));
            });

            describe("with defaultValue", () => {
                it("initializes with defaultValue", () => {
                    render(<DatagridNumberFilter {...commonProps} defaultValue={dynamicValue<Big>(new Big(100))} />);
                    expect(screen.getByRole("spinbutton")).toHaveValue(100);
                });
                it("do not sync value and defaultValue when defaultValue changes from undefined to number", () => {
                    const { rerender } = render(<DatagridNumberFilter {...commonProps} defaultValue={undefined} />);
                    expect(screen.getByRole("spinbutton")).toHaveValue(null);
                    rerender(<DatagridNumberFilter {...commonProps} defaultValue={dynamicValue<Big>(new Big(100))} />);
                    expect(screen.getByRole("spinbutton")).toHaveValue(null);
                });
                it("do not sync value and defaultValue when defaultValue changes from number to undefined", async () => {
                    const { rerender } = render(
                        <DatagridNumberFilter {...commonProps} defaultValue={dynamicValue<Big>(new Big(100))} />
                    );
                    expect(screen.getByRole("spinbutton")).toHaveValue(100);
                    rerender(<DatagridNumberFilter {...commonProps} defaultValue={undefined} />);
                    await waitFor(() => {
                        expect(screen.getByRole("spinbutton")).toHaveValue(100);
                    });
                });
            });

            afterAll(() => {
                (window as any)["com.mendix.widgets.web.filterable.filterContext"] = undefined;
            });
        });

        describe("with multiple attributes", () => {
            beforeAll(() => {
                (window as any)["com.mendix.widgets.web.filterable.filterContext"] = createContext({
                    filterDispatcher: jest.fn(),
                    multipleAttributes: {
                        attribute1: new ListAttributeValueBuilder()
                            .withId("attribute1")
                            .withType("Long")
                            .withFilterable(true)
                            .build(),
                        attribute2: new ListAttributeValueBuilder()
                            .withId("attribute2")
                            .withType("Decimal")
                            .withFilterable(true)
                            .build()
                    }
                } as FilterContextValue);
            });

            it("renders correctly", () => {
                const { asFragment } = render(<DatagridNumberFilter {...commonProps} />);

                expect(asFragment()).toMatchSnapshot();
            });

            afterAll(() => {
                (window as any)["com.mendix.widgets.web.filterable.filterContext"] = undefined;
            });
        });

        describe("with wrong attribute's type", () => {
            beforeAll(() => {
                (window as any)["com.mendix.widgets.web.filterable.filterContext"] = createContext({
                    filterDispatcher: jest.fn(),
                    singleAttribute: new ListAttributeValueBuilder().withType("Boolean").withFilterable(true).build()
                } as FilterContextValue);
            });

            it("renders error message", () => {
                const { asFragment } = render(<DatagridNumberFilter {...commonProps} />);

                expect(asFragment()).toMatchSnapshot();
            });

            afterAll(() => {
                (window as any)["com.mendix.widgets.web.filterable.filterContext"] = undefined;
            });
        });

        describe("with wrong multiple attributes' types", () => {
            beforeAll(() => {
                (window as any)["com.mendix.widgets.web.filterable.filterContext"] = createContext({
                    filterDispatcher: jest.fn(),
                    multipleAttributes: {
                        attribute1: new ListAttributeValueBuilder()
                            .withId("attribute1")
                            .withType("String")
                            .withFilterable(true)
                            .build(),
                        attribute2: new ListAttributeValueBuilder()
                            .withId("attribute2")
                            .withType("HashString")
                            .withFilterable(true)
                            .build()
                    }
                } as FilterContextValue);
            });

            it("renders error message", () => {
                const { asFragment } = render(<DatagridNumberFilter {...commonProps} />);

                expect(asFragment()).toMatchSnapshot();
            });

            afterAll(() => {
                (window as any)["com.mendix.widgets.web.filterable.filterContext"] = undefined;
            });
        });

        describe("with no context", () => {
            beforeAll(() => {
                (window as any)["com.mendix.widgets.web.filterable.filterContext"] = undefined;
            });

            it("renders error message", () => {
                const { asFragment } = render(<DatagridNumberFilter {...commonProps} />);

                expect(asFragment()).toMatchSnapshot();
            });
        });
    });

    describe("with multiple instances", () => {
        beforeAll(() => {
            (window as any)["com.mendix.widgets.web.filterable.filterContext"] = createContext({
                filterDispatcher: jest.fn(),
                singleAttribute: new ListAttributeValueBuilder().withType("Long").withFilterable(true).build()
            } as FilterContextValue);
        });

        it("renders with a unique id", () => {
            const { asFragment: fragment1 } = render(<DatagridNumberFilter {...commonProps} />);
            const { asFragment: fragment2 } = render(<DatagridNumberFilter {...commonProps} />);

            expect(fragment1().querySelector("button")?.getAttribute("aria-controls")).not.toBe(
                fragment2().querySelector("button")?.getAttribute("aria-controls")
            );
        });

        afterAll(() => {
            (window as any)["com.mendix.widgets.web.filterable.filterContext"] = undefined;
            delete (global as any)["com.mendix.widgets.web.UUID"];
        });
    });

    describe("events", () => {
        let dispatch: jest.Mock;
        let parentChannelName: string;
        let ctx: FilterContextValue;
        beforeEach(() => {
            dispatch = jest.fn();
            parentChannelName = Math.random().toString(36).slice(-10);
            ctx = {
                filterDispatcher: dispatch,
                eventsChannelName: parentChannelName,
                singleAttribute: new ListAttributeValueBuilder().withType("Long").withFilterable(true).build()
            };
            (window as any)["com.mendix.widgets.web.filterable.filterContext"] = createContext(ctx);
            deletePlugin();
        });

        it("resets value on external event", async () => {
            const plugin = requirePlugin();

            expect(dispatch).toHaveBeenCalledTimes(0);

            render(
                <DatagridNumberFilter {...commonProps} defaultValue={dynamicValue<Big>(new Big(100))} name="widget_x" />
            );

            const input = screen.getByRole("spinbutton");
            expect(dispatch).toHaveBeenCalledTimes(1);
            expect(input).toHaveValue(100);

            act(() => plugin.emit("widget_x", "reset.value"));

            expect(dispatch).toHaveBeenCalledTimes(2);
            const [{ getFilterCondition }] = dispatch.mock.lastCall;
            expect(input).toHaveValue(null);
            expect(getFilterCondition()).toEqual(undefined);
        });

        it("resets value on parent event", async () => {
            const plugin = requirePlugin();

            expect(dispatch).toHaveBeenCalledTimes(0);

            render(
                <DatagridNumberFilter {...commonProps} defaultValue={dynamicValue<Big>(new Big(100))} name="widget_x" />
            );

            const input = screen.getByRole("spinbutton");
            expect(dispatch).toHaveBeenCalledTimes(1);
            expect(input).toHaveValue(100);

            act(() => plugin.emit(parentChannelName, "reset.value"));

            expect(dispatch).toHaveBeenCalledTimes(2);
            const [{ getFilterCondition }] = dispatch.mock.lastCall;
            expect(input).toHaveValue(null);
            expect(getFilterCondition()).toEqual(undefined);
        });
    });
});
