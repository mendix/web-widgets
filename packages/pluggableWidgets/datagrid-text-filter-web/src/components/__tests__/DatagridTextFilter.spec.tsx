import "@testing-library/jest-dom";
import { FilterAPIv2 } from "@mendix/widget-plugin-filtering/context";
import { HeaderFiltersStore, HeaderFiltersStoreProps } from "@mendix/widget-plugin-filtering/stores/HeaderFiltersStore";
import {
    actionValue,
    dynamicValue,
    EditableValueBuilder,
    ListAttributeValueBuilder
} from "@mendix/widget-plugin-test-utils";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createContext, createElement } from "react";
import DatagridTextFilter from "../../DatagridTextFilter";
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
            beforeEach(() => {
                const props: HeaderFiltersStoreProps = {
                    enableFilterGroups: false,
                    filterList: [
                        {
                            filter: new ListAttributeValueBuilder()
                                .withType("String")
                                .withFormatter(
                                    value => value,
                                    value => ({ valid: true, value })
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

                rerender(<DatagridTextFilter {...commonProps} defaultValue={dynamicValue<string>("xyz")} />);
                expect(screen.getByRole("textbox")).toHaveValue("");
            });

            it("don't sync value when defaultValue changes from string to string", async () => {
                const { rerender } = render(
                    <DatagridTextFilter {...commonProps} defaultValue={dynamicValue<string>("abc")} />
                );
                expect(screen.getByRole("textbox")).toHaveValue("abc");
                rerender(<DatagridTextFilter {...commonProps} defaultValue={dynamicValue<string>("xyz")} />);
                expect(screen.getByRole("textbox")).toHaveValue("abc");
            });

            it("don't sync value when defaultValue changes from string to undefined", async () => {
                const { rerender } = render(
                    <DatagridTextFilter {...commonProps} defaultValue={dynamicValue<string>("abc")} />
                );
                expect(screen.getByRole("textbox")).toHaveValue("abc");
                rerender(<DatagridTextFilter {...commonProps} defaultValue={undefined} />);
                expect(screen.getByRole("textbox")).toHaveValue("abc");
            });
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
                                    value => ({ valid: true, value })
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

            it("triggers attribute and onchange action on change filter value", async () => {
                const action = actionValue();
                const attribute = new EditableValueBuilder<string>().build();
                render(<DatagridTextFilter {...commonProps} onChange={action} valueAttribute={attribute} />);

                const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
                await user.type(screen.getByRole("textbox"), "B");

                jest.runOnlyPendingTimers();

                expect(attribute.setValue).toHaveBeenCalled();
                expect(action.execute).toHaveBeenCalled();
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

    describe("with filter groups enabled", () => {
        beforeEach(() => {
            const props: HeaderFiltersStoreProps = {
                enableFilterGroups: true,
                filterList: [],
                groupAttrs: [
                    {
                        key: "text-filter",
                        attr: new ListAttributeValueBuilder()
                            .withType("String")
                            .withFormatter(
                                value => value,
                                value => ({ valid: true, value })
                            )
                            .withFilterable(true)
                            .build()
                    }
                ],
                groupList: [{ type: "attrs", key: "text-filter" }]
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

        it("triggers attribute and onchange action on change filter value", async () => {
            const action = actionValue();
            const attribute = new EditableValueBuilder<string>().build();
            render(
                <DatagridTextFilter
                    {...commonProps}
                    onChange={action}
                    valueAttribute={attribute}
                    placeholder={dynamicValue("Placeholder")}
                />
            );

            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
            await user.type(screen.getByPlaceholderText("Placeholder"), "B");

            jest.runOnlyPendingTimers();

            expect(action.execute).toHaveBeenCalled();
            expect(attribute.setValue).toHaveBeenCalled();
        });

        describe("with wrong group key", () => {
            beforeEach(() => {
                const props: HeaderFiltersStoreProps = {
                    enableFilterGroups: true,
                    filterList: [],
                    groupAttrs: [
                        {
                            key: "different-key",
                            attr: new ListAttributeValueBuilder()
                                .withType("String")
                                .withFormatter(
                                    value => value,
                                    value => ({ valid: true, value })
                                )
                                .withFilterable(true)
                                .build()
                        }
                    ],
                    groupList: [{ type: "attrs", key: "different-key" }]
                };
                const headerFilterStore = new HeaderFiltersStore(props, null);
                (window as any)["com.mendix.widgets.web.filterable.filterContext.v2"] = createContext<FilterAPIv2>(
                    headerFilterStore.context
                );
            });

            it("renders error message", () => {
                const { container } = render(<DatagridTextFilter {...commonProps} />);

                expect(container.querySelector(".alert")?.textContent).toEqual(
                    "Unable to get filter store. Check parent widget configuration."
                );
            });
        });
    });
});
