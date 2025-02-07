import "@testing-library/jest-dom";
import { FilterAPIv2 } from "@mendix/widget-plugin-filtering/context";
import {
    HeaderFiltersStore,
    HeaderFiltersStoreProps
} from "@mendix/widget-plugin-filtering/stores/generic/HeaderFiltersStore";
import { dynamicValue, ListAttributeValueBuilder } from "@mendix/widget-plugin-test-utils";
import { createContext, createElement } from "react";
import DatagridDropdownFilter from "../../DatagridDropdownFilter";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

export interface StaticInfo {
    name: string;
    filtersChannelName: string;
}

const commonProps = {
    class: "filter-custom-class",
    tabIndex: 0,
    name: "filter-test",
    advanced: false,
    groupKey: "dropdown-filter",
    filterable: false,
    clearable: true,
    selectionMethod: "checkbox" as const,
    selectedItemsStyle: "text" as const
};

const headerFilterStoreInfo: StaticInfo = {
    name: commonProps.name,
    filtersChannelName: ""
};

const consoleError = global.console.error;
jest.spyOn(global.console, "error").mockImplementation((...args: any[]) => {
    const [msg] = args;

    if (typeof msg === "string" && msg.startsWith("downshift:")) {
        return;
    }

    consoleError(...args);
});

describe("Dropdown Filter", () => {
    describe("with single instance", () => {
        afterEach(() => {
            delete (global as any)["com.mendix.widgets.web.UUID"];
        });

        describe("with single attribute", () => {
            function mockCtx(universe: string[]): void {
                const props: HeaderFiltersStoreProps = {
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
                    ]
                };
                const headerFilterStore = new HeaderFiltersStore(props, headerFilterStoreInfo, null);
                (window as any)["com.mendix.widgets.web.filterable.filterContext.v2"] = createContext<FilterAPIv2>(
                    headerFilterStore.context
                );
            }
            beforeEach(() => {
                mockCtx(["enum_value_1", "enum_value_2"]);
            });

            describe("with auto options", () => {
                it("loads correct values from universe", async () => {
                    const filter = render(
                        <DatagridDropdownFilter {...commonProps} auto multiSelect={false} filterOptions={[]} />
                    );

                    const trigger = filter.getByRole("combobox");

                    await fireEvent.click(trigger);

                    const items = filter.getAllByRole("option");

                    items.forEach((item, index) => {
                        if (index === 0) {
                            return;
                        }
                        expect(item.textContent).toEqual(`enum_value_${index}`);
                    });
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

                    expect(screen.getByRole("combobox")).toHaveAccessibleName("enum_value_1");
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
                        expect(screen.getByRole("combobox")).toHaveAccessibleName("Select");
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
                        expect(screen.getByRole("combobox")).toHaveAccessibleName("Select");
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

                    expect(screen.getByRole("combobox")).toHaveAccessibleName("xyz");

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
                        expect(screen.getByRole("combobox")).toHaveAccessibleName("xyz");
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
                    ]
                };
                const headerFilterStore = new HeaderFiltersStore(props, headerFilterStoreInfo, null);
                (window as any)["com.mendix.widgets.web.filterable.filterContext.v2"] = createContext<FilterAPIv2>(
                    headerFilterStore.context
                );
            });

            describe("with auto options", () => {
                it("loads correct values from universes", async () => {
                    const filter = render(
                        <DatagridDropdownFilter {...commonProps} auto multiSelect={false} filterOptions={[]} />
                    );

                    const trigger = filter.getByRole("combobox");
                    await fireEvent.click(trigger);

                    expect(filter.getAllByRole("option").map(item => item.textContent)).toStrictEqual([
                        "None",
                        "enum_value_1",
                        "enum_value_2",
                        "Yes",
                        "No"
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
                    filterList: [
                        {
                            filter: new ListAttributeValueBuilder().withType("String").withFilterable(true).build()
                        }
                    ]
                };
                const headerFilterStore = new HeaderFiltersStore(props, headerFilterStoreInfo, null);
                (window as any)["com.mendix.widgets.web.filterable.filterContext.v2"] = createContext<FilterAPIv2>(
                    headerFilterStore.context
                );
            });

            it("renders error message", () => {
                const { container } = render(
                    <DatagridDropdownFilter {...commonProps} auto multiSelect={false} filterOptions={[]} />
                );

                expect(container.querySelector(".alert")?.textContent).toBe(
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
                    ]
                };
                const headerFilterStore = new HeaderFiltersStore(props, headerFilterStoreInfo, null);
                (window as any)["com.mendix.widgets.web.filterable.filterContext.v2"] = createContext<FilterAPIv2>(
                    headerFilterStore.context
                );
            });

            it("renders error message", () => {
                const { container } = render(
                    <DatagridDropdownFilter {...commonProps} auto multiSelect={false} filterOptions={[]} />
                );

                expect(container.querySelector(".alert")?.textContent).toBe(
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
                const { container } = render(
                    <DatagridDropdownFilter {...commonProps} auto multiSelect={false} filterOptions={[]} />
                );

                expect(container.querySelector(".alert")?.textContent).toBe(
                    "The filter widget must be placed inside the column or header of the Data grid 2.0 or inside header of the Gallery widget."
                );
            });
        });

        describe("with invalid values", () => {
            beforeAll(() => {
                const props: HeaderFiltersStoreProps = {
                    filterList: [
                        {
                            filter: new ListAttributeValueBuilder()
                                .withUniverse(["enum_value_1", "enum_value_2"])
                                .withType("Enum")
                                .withFilterable(true)
                                .build()
                        }
                    ]
                };
                const headerFilterStore = new HeaderFiltersStore(props, headerFilterStoreInfo, null);
                (window as any)["com.mendix.widgets.web.filterable.filterContext.v2"] = createContext<FilterAPIv2>(
                    headerFilterStore.context
                );
            });

            it("renders error message", () => {
                const { container } = render(
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

                expect(container.querySelector(".alert")?.textContent).toBe("Invalid option value: 'enum_value_3'");
            });
        });

        describe("with multiple invalid values", () => {
            beforeAll(() => {
                const props: HeaderFiltersStoreProps = {
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
                    ]
                };
                const headerFilterStore = new HeaderFiltersStore(props, headerFilterStoreInfo, null);
                (window as any)["com.mendix.widgets.web.filterable.filterContext.v2"] = createContext<FilterAPIv2>(
                    headerFilterStore.context
                );
            });

            it("renders error message", () => {
                const { container } = render(
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

                expect(container.querySelector(".alert")?.textContent).toBe("Invalid option value: 'enum_value_3'");
            });
        });
    });

    describe("with multiple instances", () => {
        beforeAll(() => {
            const props: HeaderFiltersStoreProps = {
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
                ]
            };
            const headerFilterStore = new HeaderFiltersStore(props, headerFilterStoreInfo, null);
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

            expect(fragment1().querySelector("button")?.getAttribute("aria-controls")).not.toBe(
                fragment2().querySelector("button")?.getAttribute("aria-controls")
            );
        });

        afterAll(() => {
            (window as any)["com.mendix.widgets.web.filterable.filterContext.v2"] = undefined;
            delete (global as any)["com.mendix.widgets.web.UUID"];
        });
    });
});
