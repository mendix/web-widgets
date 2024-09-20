import "@testing-library/jest-dom";
import { FilterAPIv2 } from "@mendix/widget-plugin-filtering/context";
import { HeaderFiltersStore, HeaderFiltersStoreProps } from "@mendix/widget-plugin-filtering/stores/HeaderFiltersStore";
import {
    actionValue,
    dynamicValue,
    EditableValueBuilder,
    ListAttributeValueBuilder
} from "@mendix/widget-plugin-test-utils";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createContext, createElement } from "react";

import DatagridNumberFilter from "../../DatagridNumberFilter";
import { Big } from "big.js";
import { DatagridNumberFilterContainerProps } from "../../../typings/DatagridNumberFilterProps";

const commonProps: DatagridNumberFilterContainerProps = {
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
            beforeEach(() => {
                const props: HeaderFiltersStoreProps = {
                    filterList: [
                        {
                            filter: new ListAttributeValueBuilder()
                                .withType("Long")
                                .withFormatter(
                                    value => (value ? value.toString() : ""),
                                    (value: string) => ({ valid: true, value })
                                )
                                .withFilterable(true)
                                .build()
                        }
                    ]
                };
                const headerFilterStore = new HeaderFiltersStore(props, null);
                (window as any)["com.mendix.widgets.web.filterable.filterContext.v2"] = createContext<FilterAPIv2>(
                    headerFilterStore.context
                );
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

                expect(action.execute).toHaveBeenCalledTimes(1);
                expect(attribute.setValue).toHaveBeenCalledWith("10");
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
                (window as any)["com.mendix.widgets.web.filterable.filterContext.v2"] = undefined;
            });
        });

        describe("with multiple attributes", () => {
            beforeEach(() => {
                const props: HeaderFiltersStoreProps = {
                    filterList: [
                        {
                            filter: new ListAttributeValueBuilder()
                                .withId("attribute1")
                                .withType("Long")
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
                                .withType("Decimal")
                                .withFormatter(
                                    value => value,
                                    () => console.log("Parsed")
                                )
                                .withFilterable(true)
                                .build()
                        }
                    ]
                };
                const headerFilterStore = new HeaderFiltersStore(props, null);
                (window as any)["com.mendix.widgets.web.filterable.filterContext.v2"] = createContext<FilterAPIv2>(
                    headerFilterStore.context
                );
            });

            it("renders correctly", () => {
                const { asFragment } = render(<DatagridNumberFilter {...commonProps} />);

                expect(asFragment()).toMatchSnapshot();
            });

            afterAll(() => {
                (window as any)["com.mendix.widgets.web.filterable.filterContext.v2"] = undefined;
            });
        });

        describe("with wrong attribute's type", () => {
            beforeAll(() => {
                const props: HeaderFiltersStoreProps = {
                    filterList: [
                        { filter: new ListAttributeValueBuilder().withType("Boolean").withFilterable(true).build() }
                    ]
                };
                const headerFilterStore = new HeaderFiltersStore(props, null);
                (window as any)["com.mendix.widgets.web.filterable.filterContext.v2"] = createContext<FilterAPIv2>(
                    headerFilterStore.context
                );
            });

            it("renders error message", () => {
                const { asFragment } = render(<DatagridNumberFilter {...commonProps} />);

                expect(asFragment()).toMatchSnapshot();
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
                                .withSortable(true)
                                .build()
                        },
                        {
                            filter: new ListAttributeValueBuilder()
                                .withId("attribute2")
                                .withType("HashString")
                                .withFilterable(true)
                                .build()
                        }
                    ]
                };
                const headerFilterStore = new HeaderFiltersStore(props, null);
                (window as any)["com.mendix.widgets.web.filterable.filterContext.v2"] = createContext<FilterAPIv2>(
                    headerFilterStore.context
                );
            });

            it("renders error message", () => {
                const { asFragment } = render(<DatagridNumberFilter {...commonProps} />);

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
                const { asFragment } = render(<DatagridNumberFilter {...commonProps} />);

                expect(asFragment()).toMatchSnapshot();
            });
        });
    });

    describe("with multiple instances", () => {
        beforeEach(() => {
            const props: HeaderFiltersStoreProps = {
                filterList: [
                    {
                        filter: new ListAttributeValueBuilder()
                            .withType("Long")
                            .withFormatter(
                                value => value,
                                () => console.log("Parsed")
                            )
                            .withFilterable(true)
                            .build()
                    }
                ]
            };
            const headerFilterStore = new HeaderFiltersStore(props, null);
            (window as any)["com.mendix.widgets.web.filterable.filterContext.v2"] = createContext<FilterAPIv2>(
                headerFilterStore.context
            );
        });

        it("renders with a unique id", () => {
            const { asFragment: fragment1 } = render(<DatagridNumberFilter {...commonProps} />);
            const { asFragment: fragment2 } = render(<DatagridNumberFilter {...commonProps} />);

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
