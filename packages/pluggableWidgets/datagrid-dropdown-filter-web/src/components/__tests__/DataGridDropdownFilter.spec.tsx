import "@testing-library/jest-dom";
import { Alert } from "@mendix/widget-plugin-component-kit/Alert";
import { FilterAPIv2 } from "@mendix/widget-plugin-filtering/context";
import { HeaderFiltersStore, HeaderFiltersStoreProps } from "@mendix/widget-plugin-filtering/stores/HeaderFiltersStore";
import { dynamicValue, ListAttributeValueBuilder } from "@mendix/widget-plugin-test-utils";
import { createContext, createElement } from "react";
import DatagridDropdownFilter from "../../DatagridDropdownFilter";
import { render, screen, waitFor } from "@testing-library/react";
import { mount } from "enzyme";
// import { RefFilterContainer } from "../RefFilterContainer";
import { StaticFilterContainer } from "../StaticFilterContainer";

const commonProps = {
    class: "filter-custom-class",
    tabIndex: 0,
    name: "filter-test",
    advanced: false,
    groupKey: "dropdown-filter"
};

describe("Dropdown Filter", () => {
    describe("with single instance", () => {
        afterEach(() => {
            delete (global as any)["com.mendix.widgets.web.UUID"];
        });

        describe("with single attribute", () => {
            function mockCtx(universe: string[]): void {
                const props: HeaderFiltersStoreProps = {
                    enableFilterGroups: false,
                    filterList: [
                        {
                            filter: new ListAttributeValueBuilder()
                                .withUniverse(universe)
                                .withType("Enum")
                                .withFilterable(true)
                                .withFormatter(
                                    value => value,
                                    () => console.log("Parsed")
                                )
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
            }
            beforeEach(() => {
                mockCtx(["enum_value_1", "enum_value_2"]);
            });

            describe("with auto options", () => {
                it("loads correct values from universe", () => {
                    const filter = mount(
                        <DatagridDropdownFilter {...commonProps} auto multiSelect={false} filterOptions={[]} />
                    );

                    expect(filter.find(StaticFilterContainer).props().filterStore.options).toStrictEqual([
                        {
                            caption: "enum_value_1",
                            value: "enum_value_1",
                            selected: false
                        },
                        {
                            caption: "enum_value_2",
                            value: "enum_value_2",
                            selected: false
                        }
                    ]);
                });
            });

            describe("DOM structure", () => {
                it("renders correctly", () => {
                    const { asFragment } = render(
                        <DatagridDropdownFilter {...commonProps} auto multiSelect={false} filterOptions={[]} />
                    );

                    expect(asFragment()).toMatchSnapshot();
                });
            });

            describe("with defaultValue", () => {
                it("initialize component with defaultValue", () => {
                    render(
                        <DatagridDropdownFilter
                            {...commonProps}
                            auto
                            multiSelect={false}
                            filterOptions={[]}
                            defaultValue={dynamicValue<string>("enum_value_1")}
                        />
                    );

                    expect(screen.getByRole("textbox")).toHaveValue("enum_value_1");
                });

                it("don't sync defaultValue with state when defaultValue changes from undefined to string", async () => {
                    const { rerender } = render(
                        <DatagridDropdownFilter
                            {...commonProps}
                            auto
                            multiSelect={false}
                            filterOptions={[]}
                            defaultValue={dynamicValue<string>("")}
                        />
                    );

                    await waitFor(() => {
                        expect(screen.getByRole("textbox")).toHaveValue("");
                    });

                    // “Real” context causes widgets to re-renders multiple times, replicate this in mocked context.
                    rerender(
                        <DatagridDropdownFilter
                            {...commonProps}
                            auto
                            multiSelect={false}
                            filterOptions={[]}
                            defaultValue={dynamicValue<string>("")}
                        />
                    );
                    rerender(
                        <DatagridDropdownFilter
                            {...commonProps}
                            auto
                            multiSelect={false}
                            filterOptions={[]}
                            defaultValue={dynamicValue<string>("enum_value_1")}
                        />
                    );

                    await waitFor(() => {
                        expect(screen.getByRole("textbox")).toHaveValue("");
                    });
                });

                it("don't sync defaultValue with state when defaultValue changes from string to undefined", async () => {
                    mockCtx(["xyz", "abc"]);
                    const { rerender } = render(
                        <DatagridDropdownFilter
                            {...commonProps}
                            auto
                            multiSelect={false}
                            filterOptions={[]}
                            defaultValue={dynamicValue<string>("xyz")}
                        />
                    );

                    expect(screen.getByRole("textbox")).toHaveValue("xyz");

                    // “Real” context causes widgets to re-renders multiple times, replicate this in mocked context.
                    rerender(
                        <DatagridDropdownFilter
                            {...commonProps}
                            auto
                            multiSelect={false}
                            filterOptions={[]}
                            defaultValue={dynamicValue<string>("xyz")}
                        />
                    );
                    rerender(
                        <DatagridDropdownFilter
                            {...commonProps}
                            auto
                            multiSelect={false}
                            filterOptions={[]}
                            defaultValue={undefined}
                        />
                    );

                    await waitFor(() => {
                        expect(screen.getByRole("textbox")).toHaveValue("xyz");
                    });
                });
            });

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
                                .withUniverse(["enum_value_1", "enum_value_2"])
                                .withType("Enum")
                                .withFilterable(true)
                                .withFormatter(
                                    value => value,
                                    () => console.log("Parsed")
                                )
                                .build()
                        },
                        {
                            filter: new ListAttributeValueBuilder()
                                .withId("attribute2")
                                .withUniverse([true, false])
                                .withType("Boolean")
                                .withFilterable(true)
                                .withFormatter(
                                    value => (value ? "Yes" : "No"),
                                    () => console.log("Parsed")
                                )
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

            describe("with auto options", () => {
                it("loads correct values from universes", () => {
                    const filter = mount(
                        <DatagridDropdownFilter {...commonProps} auto multiSelect={false} filterOptions={[]} />
                    );

                    expect(filter.find(StaticFilterContainer).props().filterStore.options).toStrictEqual([
                        {
                            caption: "enum_value_1",
                            value: "enum_value_1",
                            selected: false
                        },
                        {
                            caption: "enum_value_2",
                            value: "enum_value_2",
                            selected: false
                        },
                        {
                            caption: "Yes",
                            value: "true",
                            selected: false
                        },
                        {
                            caption: "No",
                            value: "false",
                            selected: false
                        }
                    ]);
                });
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
                        {
                            filter: new ListAttributeValueBuilder().withType("String").withFilterable(true).build()
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
                const filter = mount(
                    <DatagridDropdownFilter {...commonProps} auto multiSelect={false} filterOptions={[]} />
                );

                expect(filter.find(Alert).text()).toBe(
                    "Unable to get filter store. Check parent widget configuration."
                );
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
                                .withType("String")
                                .withFilterable(true)
                                .build()
                        },
                        {
                            filter: new ListAttributeValueBuilder()
                                .withId("attribute2")
                                .withType("Decimal")
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
                const filter = mount(
                    <DatagridDropdownFilter {...commonProps} auto multiSelect={false} filterOptions={[]} />
                );

                expect(filter.find(Alert).text()).toBe(
                    "Unable to get filter store. Check parent widget configuration."
                );
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
                const filter = mount(
                    <DatagridDropdownFilter {...commonProps} auto multiSelect={false} filterOptions={[]} />
                );

                expect(filter.find(Alert).text()).toBe(
                    "The filter widget must be placed inside the column or header of the Data grid 2.0 or inside header of the Gallery widget."
                );
            });
        });

        describe("with invalid values", () => {
            beforeAll(() => {
                const props: HeaderFiltersStoreProps = {
                    enableFilterGroups: false,
                    filterList: [
                        {
                            filter: new ListAttributeValueBuilder()
                                .withUniverse(["enum_value_1", "enum_value_2"])
                                .withType("Enum")
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
                const filter = mount(
                    <DatagridDropdownFilter
                        {...commonProps}
                        auto={false}
                        multiSelect={false}
                        filterOptions={[
                            {
                                caption: dynamicValue<string>("wrong value"),
                                value: dynamicValue<string>("enum_value_3")
                            }
                        ]}
                    />
                );

                expect(filter.find(Alert).text()).toBe("Invalid option value: 'enum_value_3'");
            });
        });

        describe("with multiple invalid values", () => {
            beforeAll(() => {
                const props: HeaderFiltersStoreProps = {
                    enableFilterGroups: false,
                    filterList: [
                        {
                            filter: new ListAttributeValueBuilder()
                                .withUniverse(["enum_value_1", "enum_value_2"])
                                .withType("Enum")
                                .withFilterable(true)
                                .build()
                        },
                        {
                            filter: new ListAttributeValueBuilder()
                                .withUniverse([true, false])
                                .withType("Boolean")
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
                const filter = mount(
                    <DatagridDropdownFilter
                        {...commonProps}
                        auto={false}
                        multiSelect={false}
                        filterOptions={[
                            {
                                caption: dynamicValue<string>("wrong enum value"),
                                value: dynamicValue<string>("enum_value_3")
                            },
                            {
                                caption: dynamicValue<string>("wrong boolean value"),
                                value: dynamicValue<string>("no")
                            }
                        ]}
                    />
                );

                expect(filter.find(Alert).text()).toBe("Invalid option value: 'enum_value_3'");
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
                            .withUniverse(["enum_value_1", "enum_value_2"])
                            .withType("Enum")
                            .withFilterable(true)
                            .withFormatter(
                                value => value,
                                () => console.log("Parsed")
                            )
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
            const { asFragment: fragment1 } = render(
                <DatagridDropdownFilter {...commonProps} auto multiSelect={false} filterOptions={[]} />
            );
            const { asFragment: fragment2 } = render(
                <DatagridDropdownFilter {...commonProps} auto multiSelect={false} filterOptions={[]} />
            );

            expect(fragment1().querySelector("input")?.getAttribute("aria-controls")).not.toBe(
                fragment2().querySelector("input")?.getAttribute("aria-controls")
            );
        });

        afterAll(() => {
            (window as any)["com.mendix.widgets.web.filterable.filterContext.v2"] = undefined;
            delete (global as any)["com.mendix.widgets.web.UUID"];
        });
    });
});
