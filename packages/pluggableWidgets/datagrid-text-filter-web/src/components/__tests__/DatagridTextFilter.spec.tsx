import "@testing-library/jest-dom";
import { FilterAPIv2 } from "@mendix/widget-plugin-filtering/context";
import { HeaderFiltersStore, HeaderFiltersStoreProps } from "@mendix/widget-plugin-filtering/stores/HeaderFiltersStore";
import {
    // actionValue,
    dynamicValue,
    // EditableValueBuilder,
    ListAttributeValueBuilder
} from "@mendix/widget-plugin-test-utils";
import { render, screen } from "@testing-library/react";
// import userEvent from "@testing-library/user-event";
import { createContext, createElement } from "react";
import DatagridTextFilter from "../../DatagridTextFilter";
// import { requirePlugin, deletePlugin } from "@mendix/widget-plugin-external-events/plugin";
import { DatagridTextFilterContainerProps } from "../../../typings/DatagridTextFilterProps";

const commonProps: DatagridTextFilterContainerProps = {
    class: "filter-custom-class",
    tabIndex: 0,
    name: "filter-test",
    defaultFilter: "equal" as const,
    adjustable: true,
    advanced: false,
    delay: 1000,
    groupKey: "text-filter"
};

jest.useFakeTimers();

describe("Text Filter", () => {
    describe("with single instance", () => {
        afterEach(() => {
            delete (global as any)["com.mendix.widgets.web.UUID"];
        });

        describe("with defaultValue prop", () => {
            beforeAll(() => {
                const props: HeaderFiltersStoreProps = {
                    enableFilterGroups: false,
                    filterList: [
                        {
                            filter: new ListAttributeValueBuilder()
                                .withType("String")
                                .withFormatter(
                                    value => value,
                                    () => console.log("Parsed")
                                )
                                .withFilterable(true)
                                .build()
                        }
                    ],
                    groupAttrs: [],
                    groupList: []
                };
                const headerFilterStore = new HeaderFiltersStore(props, null);
                (window as any)["com.mendix.widgets.web.filterable.filterContext.v2"] = createContext<FilterAPIv2>(
                    headerFilterStore.context
                );
            });

            it("don't sync value when defaultValue changes from undefined to string", async () => {
                const { rerender } = render(<DatagridTextFilter {...commonProps} defaultValue={undefined} />);
                expect(screen.getByRole("textbox")).toHaveValue("");
                const defaultValue = dynamicValue<string>("xyz");
                rerender(<DatagridTextFilter {...commonProps} defaultValue={defaultValue} />);
                expect(screen.getByRole("textbox")).toHaveValue("");
            });

            // it("don't sync value when defaultValue changes from string to string", async () => {
            //     const { rerender } = render(
            //         <DatagridTextFilter {...commonProps} defaultValue={dynamicValue<string>("abc")} />
            //     );
            //     expect(screen.getByRole("textbox")).toHaveValue("abc");
            //     rerender(<DatagridTextFilter {...commonProps} defaultValue={dynamicValue<string>("xyz")} />);
            //     expect(screen.getByRole("textbox")).toHaveValue("abc");
            // });

            // it("don't sync value when defaultValue changes from string to undefined", async () => {
            //     const { rerender } = render(
            //         <DatagridTextFilter {...commonProps} defaultValue={dynamicValue<string>("abc")} />
            //     );
            //     expect(screen.getByRole("textbox")).toHaveValue("abc");
            //     rerender(<DatagridTextFilter {...commonProps} defaultValue={undefined} />);
            //     expect(screen.getByRole("textbox")).toHaveValue("abc");
            // });
        });

        describe("with single attribute", () => {
            beforeAll(() => {
                const props: HeaderFiltersStoreProps = {
                    enableFilterGroups: false,
                    filterList: [
                        {
                            filter: new ListAttributeValueBuilder()
                                .withType("String")
                                .withFormatter(
                                    value => value,
                                    () => console.log("Parsed")
                                )
                                .withFilterable(true)
                                .build()
                        }
                    ],
                    groupAttrs: [],
                    groupList: []
                };
                const headerFilterStore = new HeaderFiltersStore(props, null);
                (window as any)["com.mendix.widgets.web.filterable.filterContext.v2"] = createContext<FilterAPIv2>(
                    headerFilterStore.context
                );
            });

            it("renders correctly", () => {
                const { asFragment } = render(<DatagridTextFilter {...commonProps} />);

                expect(asFragment()).toMatchSnapshot();
            });

            // it("triggers attribute and onchange action on change filter value", async () => {
            //     const action = actionValue();
            //     const attribute = new EditableValueBuilder<string>().build();
            //     render(<DatagridTextFilter {...commonProps} onChange={action} valueAttribute={attribute} />);

            //     const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
            //     await user.type(screen.getByRole("textbox"), "B");

            //     jest.runOnlyPendingTimers();

            //     expect(attribute.setValue).toHaveBeenCalled();
            //     expect(action.execute).toHaveBeenCalled();
            // });

            afterAll(() => {
                (window as any)["com.mendix.widgets.web.filterable.filterContext.v2"] = undefined;
            });
        });

        describe("with multiple attributes", () => {
            beforeAll(() => {
                const props: HeaderFiltersStoreProps = {
                    enableFilterGroups: false,
                    filterList: [
                        {
                            filter: new ListAttributeValueBuilder()
                                .withId("attribute1")
                                .withType("String")
                                .withFormatter(
                                    value => value,
                                    () => console.log("Parsed")
                                )
                                .withFilterable(true)
                                .build()
                        },
                        {
                            filter: new ListAttributeValueBuilder()
                                .withId("attribute2")
                                .withType("HashString")
                                .withFormatter(
                                    value => value,
                                    () => console.log("Parsed")
                                )
                                .withFilterable(true)
                                .build()
                        }
                    ],
                    groupAttrs: [],
                    groupList: []
                };
                const headerFilterStore = new HeaderFiltersStore(props, null);
                (window as any)["com.mendix.widgets.web.filterable.filterContext.v2"] = createContext<FilterAPIv2>(
                    headerFilterStore.context
                );
            });

            it("renders correctly", () => {
                const { asFragment } = render(<DatagridTextFilter {...commonProps} />);

                expect(asFragment()).toMatchSnapshot();
            });

            afterAll(() => {
                (window as any)["com.mendix.widgets.web.filterable.filterContext.v2"] = undefined;
            });
        });

        describe("with wrong attribute's type", () => {
            beforeAll(() => {
                const props: HeaderFiltersStoreProps = {
                    enableFilterGroups: false,
                    filterList: [
                        { filter: new ListAttributeValueBuilder().withType("Decimal").withFilterable(true).build() }
                    ],
                    groupAttrs: [],
                    groupList: []
                };
                const headerFilterStore = new HeaderFiltersStore(props, null);
                (window as any)["com.mendix.widgets.web.filterable.filterContext.v2"] = createContext<FilterAPIv2>(
                    headerFilterStore.context
                );
            });

            it("renders error message", () => {
                const { asFragment } = render(<DatagridTextFilter {...commonProps} />);

                expect(asFragment()).toMatchSnapshot();
            });

            afterAll(() => {
                (window as any)["com.mendix.widgets.web.filterable.filterContext.v2"] = undefined;
            });
        });

        describe("with wrong multiple attributes' types", () => {
            beforeAll(() => {
                const props: HeaderFiltersStoreProps = {
                    enableFilterGroups: false,
                    filterList: [
                        {
                            filter: new ListAttributeValueBuilder()
                                .withId("attribute1")
                                .withType("Decimal")
                                .withFilterable(true)
                                .build()
                        },
                        {
                            filter: new ListAttributeValueBuilder()
                                .withId("attribute2")
                                .withType("Long")
                                .withFilterable(true)
                                .build()
                        }
                    ],
                    groupAttrs: [],
                    groupList: []
                };
                const headerFilterStore = new HeaderFiltersStore(props, null);
                (window as any)["com.mendix.widgets.web.filterable.filterContext.v2"] = createContext<FilterAPIv2>(
                    headerFilterStore.context
                );
            });

            it("renders error message", () => {
                const { asFragment } = render(<DatagridTextFilter {...commonProps} />);

                expect(asFragment()).toMatchSnapshot();
            });

            afterAll(() => {
                (window as any)["com.mendix.widgets.web.filterable.filterContext.v2"] = undefined;
            });
        });

        describe("with no context", () => {
            beforeAll(() => {
                (window as any)["com.mendix.widgets.web.filterable.filterContext.v2"] = undefined;
            });

            it("renders error message", () => {
                const { asFragment } = render(<DatagridTextFilter {...commonProps} />);

                expect(asFragment()).toMatchSnapshot();
            });
        });
    });

    describe("with multiple instances", () => {
        beforeAll(() => {
            const props: HeaderFiltersStoreProps = {
                enableFilterGroups: false,
                filterList: [
                    {
                        filter: new ListAttributeValueBuilder()
                            .withType("String")
                            .withFormatter(
                                value => value,
                                () => console.log("Parsed")
                            )
                            .withFilterable(true)
                            .build()
                    }
                ],
                groupAttrs: [],
                groupList: []
            };
            const headerFilterStore = new HeaderFiltersStore(props, null);
            (window as any)["com.mendix.widgets.web.filterable.filterContext.v2"] = createContext<FilterAPIv2>(
                headerFilterStore.context
            );
        });

        it("renders with a unique id", () => {
            const { asFragment: fragment1 } = render(<DatagridTextFilter {...commonProps} />);
            const { asFragment: fragment2 } = render(<DatagridTextFilter {...commonProps} />);

            expect(fragment1().querySelector("button")?.getAttribute("aria-controls")).not.toBe(
                fragment2().querySelector("button")?.getAttribute("aria-controls")
            );
        });

        afterAll(() => {
            (window as any)["com.mendix.widgets.web.filterable.filterContext.v2"] = undefined;
            delete (global as any)["com.mendix.widgets.web.UUID"];
        });
    });

    // describe("events", () => {
    //     let parentChannelName: string;
    //     let headerFilterStore: HeaderFiltersStore;

    //     beforeEach(() => {
    //         parentChannelName = Math.random().toString(36).slice(-10);
    //         const props: HeaderFiltersStoreProps = {
    //             enableFilterGroups: false,
    //             filterList: [
    //                 {
    //                     filter: new ListAttributeValueBuilder()
    //                         .withType("String")
    //                         .withFormatter(
    //                             value => value,
    //                             () => console.log("Parsed")
    //                         )
    //                         .withFilterable(true)
    //                         .build()
    //                 }
    //             ],
    //             groupAttrs: [],
    //             groupList: []
    //         };
    //         headerFilterStore = new HeaderFiltersStore(props, null);
    //         (window as any)["com.mendix.widgets.web.filterable.filterContext.v2"] = createContext<FilterAPIv2>({
    //             version: 2,
    //             parentChannelName,
    //             provider: headerFilterStore.createProvider(props, null)
    //         });
    //         deletePlugin();
    //     });

    //     it("resets value on external event", async () => {
    //         const plugin = requirePlugin();

    //         // expect(dispatch).toHaveBeenCalledTimes(0);

    //         render(<DatagridTextFilter {...commonProps} defaultValue={dynamicValue<string>("foo")} name="widget_x" />);

    //         const input = screen.getByRole("textbox");
    //         // expect(dispatch).toHaveBeenCalledTimes(1);
    //         expect(input).toHaveValue("foo");

    //         act(() => plugin.emit("widget_x", "reset.value"));

    //         // expect(dispatch).toHaveBeenCalledTimes(2);
    //         // const [{ getFilterCondition }] = dispatch.mock.lastCall;
    //         expect(input).toHaveValue("");
    //         expect(headerFilterStore.conditions[0]).toEqual(undefined);
    //     });

    //     it("resets value on parent event", async () => {
    //         const plugin = requirePlugin();

    //         // expect(dispatch).toHaveBeenCalledTimes(0);

    //         render(<DatagridTextFilter {...commonProps} defaultValue={dynamicValue<string>("bar")} name="widget_x" />);

    //         const input = screen.getByRole("textbox");
    //         // expect(dispatch).toHaveBeenCalledTimes(1);
    //         expect(input).toHaveValue("bar");

    //         act(() => plugin.emit(parentChannelName, "reset.value"));

    //         // expect(dispatch).toHaveBeenCalledTimes(2);
    //         // const [{ getFilterCondition }] = dispatch.mock.lastCall;
    //         expect(input).toHaveValue("");
    //         expect(headerFilterStore.conditions[0]).toEqual(undefined);
    //     });
    // });
});
