import "@testing-library/jest-dom";
import { FilterAPIv2 } from "@mendix/widget-plugin-filtering/context";
import {
    HeaderFiltersStore,
    HeaderFiltersStoreProps
} from "@mendix/widget-plugin-filtering/stores/generic/HeaderFiltersStore";
import {
    actionValue,
    dynamicValue,
    EditableValueBuilder,
    ListAttributeValueBuilder
} from "@mendix/widget-plugin-test-utils";
import { render, fireEvent, screen, act } from "@testing-library/react";
import { createContext, createElement } from "react";
import DatagridDateFilter from "../../DatagridDateFilter";
import { DatagridDateFilterContainerProps } from "../../../typings/DatagridDateFilterProps";
import { MXGlobalObject, MXSessionConfig } from "../../../typings/global";

export interface StaticInfo {
    name: string;
    filtersChannelName: string;
}

function createMXObjectMock(
    code: string,
    langTag: string,
    firstDayOfWeek = 0,
    patterns = {
        date: "M/d/yyyy",
        datetime: "M/d/yyyy, h:mm a",
        time: "h:mm a"
    }
): MXGlobalObject {
    return {
        session: {
            getConfig: (): MXSessionConfig => ({
                locale: {
                    code,
                    firstDayOfWeek,
                    languageTag: langTag,
                    patterns
                }
            })
        }
    };
}

const commonProps: DatagridDateFilterContainerProps = {
    class: "filter-custom-class",
    tabIndex: 0,
    name: "filter-test",
    defaultFilter: "equal" as const,
    adjustable: true,
    advanced: false
};

const headerFilterStoreInfo: StaticInfo = {
    name: commonProps.name,
    filtersChannelName: ""
};

const mxObject = createMXObjectMock("en_US", "en-US");

describe("Date Filter", () => {
    describe("with single instance", () => {
        afterEach(() => {
            delete (global as any)["com.mendix.widgets.web.UUID"];
        });

        describe("with single attribute", () => {
            beforeEach(() => {
                const props: HeaderFiltersStoreProps = {
                    filterList: [
                        { filter: new ListAttributeValueBuilder().withType("DateTime").withFilterable(true).build() }
                    ]
                };
                const headerFilterStore = new HeaderFiltersStore(props, headerFilterStoreInfo, null);
                (window as any)["com.mendix.widgets.web.filterable.filterContext.v2"] = createContext<FilterAPIv2>(
                    headerFilterStore.context
                );
                (window as any).mx = mxObject;

                jest.spyOn(global.Math, "random").mockReturnValue(0.123456789);
            });

            it("renders correctly", () => {
                const { asFragment } = render(<DatagridDateFilter {...commonProps} />);
                expect(asFragment()).toMatchSnapshot();
            });

            it("triggers attribute and onchange action on change filter value", () => {
                const action = actionValue();
                const attribute = new EditableValueBuilder<Date>().build();
                render(
                    <DatagridDateFilter
                        {...commonProps}
                        onChange={action}
                        valueAttribute={attribute}
                        placeholder={dynamicValue("Placeholder")}
                    />
                );

                fireEvent.input(screen.getByPlaceholderText("Placeholder"), { target: { value: "01/12/2020" } });

                expect(action.execute).toHaveBeenCalledTimes(1);
                expect(attribute.setValue).toHaveBeenCalledTimes(1);
            });

            describe("with defaultValue", () => {
                it("initialize with defaultValue", async () => {
                    // 946684800000 = 01.01.2000
                    const date = new Date(946684800000);
                    render(<DatagridDateFilter {...commonProps} defaultValue={dynamicValue<Date>(date)} />);
                    expect(screen.getByRole("textbox")).toHaveValue("01/01/2000");
                });

                it("don't sync value when defaultValue changes from undefined to date", async () => {
                    // 946684800000 = 01.01.2000
                    const date = new Date(946684800000);
                    const { rerender } = render(<DatagridDateFilter {...commonProps} defaultValue={undefined} />);
                    expect(screen.getByRole("textbox")).toHaveValue("");

                    rerender(<DatagridDateFilter {...commonProps} defaultValue={dynamicValue<Date>(date)} />);
                    expect(screen.getByRole("textbox")).toHaveValue("");
                });

                it("don't sync value when defaultValue changes from date to undefined", async () => {
                    // 946684800000 = 01.01.2000
                    const date = new Date(946684800000);
                    const { rerender } = render(
                        <DatagridDateFilter {...commonProps} defaultValue={dynamicValue<Date>(date)} />
                    );
                    expect(screen.getByRole("textbox")).toHaveValue("01/01/2000");

                    rerender(<DatagridDateFilter {...commonProps} defaultValue={undefined} />);
                    expect(screen.getByRole("textbox")).toHaveValue("01/01/2000");
                });
            });

            afterAll(() => {
                (window as any)["com.mendix.widgets.web.filterable.filterContext.v2"] = undefined;
            });
        });

        describe("with double attributes", () => {
            beforeAll(() => {
                const props: HeaderFiltersStoreProps = {
                    filterList: [
                        {
                            filter: new ListAttributeValueBuilder()
                                .withId("attr1")
                                .withType("DateTime")
                                .withFilterable(true)
                                .build()
                        },
                        {
                            filter: new ListAttributeValueBuilder()
                                .withId("attr2")
                                .withType("DateTime")
                                .withFilterable(true)
                                .build()
                        }
                    ]
                };
                const headerFilterStore = new HeaderFiltersStore(props, headerFilterStoreInfo, null);
                (window as any)["com.mendix.widgets.web.filterable.filterContext.v2"] = createContext<FilterAPIv2>(
                    headerFilterStore.context
                );
                (window as any).mx = mxObject;

                jest.spyOn(global.Math, "random").mockReturnValue(0.123456789);
            });

            it("renders correctly", () => {
                const { asFragment } = render(<DatagridDateFilter {...commonProps} />);

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
                        { filter: new ListAttributeValueBuilder().withType("Decimal").withFilterable(true).build() }
                    ]
                };
                const headerFilterStore = new HeaderFiltersStore(props, headerFilterStoreInfo, null);
                (window as any)["com.mendix.widgets.web.filterable.filterContext.v2"] = createContext<FilterAPIv2>(
                    headerFilterStore.context
                );
                (window as any).mx = mxObject;
            });

            it("renders error message", () => {
                const { container } = render(<DatagridDateFilter {...commonProps} />);

                expect(container.querySelector(".alert")?.textContent).toEqual(
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
                                .withId("attr1")
                                .withType("String")
                                .withFilterable(true)
                                .build()
                        },
                        {
                            filter: new ListAttributeValueBuilder()
                                .withId("attr2")
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
                (window as any).mx = mxObject;
            });

            it("renders error message", () => {
                const { container } = render(<DatagridDateFilter {...commonProps} />);

                expect(container.querySelector(".alert")?.textContent).toEqual(
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
                (window as any).mx = mxObject;
            });

            it("renders error message", () => {
                const { container } = render(<DatagridDateFilter {...commonProps} />);

                expect(container.querySelector(".alert")?.textContent).toEqual(
                    "The filter widget must be placed inside the column or header of the Data grid 2.0 or inside header of the Gallery widget."
                );
            });
        });
    });

    describe("with multiple instances", () => {
        beforeAll(() => {
            const props: HeaderFiltersStoreProps = {
                filterList: [
                    { filter: new ListAttributeValueBuilder().withType("DateTime").withFilterable(true).build() }
                ]
            };
            const headerFilterStore = new HeaderFiltersStore(props, headerFilterStoreInfo, null);
            (window as any)["com.mendix.widgets.web.filterable.filterContext.v2"] = createContext<FilterAPIv2>(
                headerFilterStore.context
            );
            (window as any).mx = mxObject;

            jest.spyOn(global.Math, "random").mockReturnValue(0.123456789);
        });

        it("renders with a unique id", () => {
            const { asFragment: fragment1 } = render(<DatagridDateFilter {...commonProps} />);
            const { asFragment: fragment2 } = render(<DatagridDateFilter {...commonProps} />);

            expect(fragment1().querySelector("span")?.id).not.toBe(fragment2().querySelector("span")?.id);
        });

        afterAll(() => {
            (window as any)["com.mendix.widgets.web.filterable.filterContext.v2"] = undefined;
            delete (global as any)["com.mendix.widgets.web.UUID"];
        });
    });

    describe("with session config", () => {
        beforeEach(() => {
            const props: HeaderFiltersStoreProps = {
                filterList: [
                    { filter: new ListAttributeValueBuilder().withType("DateTime").withFilterable(true).build() }
                ]
            };
            const headerFilterStore = new HeaderFiltersStore(props, headerFilterStoreInfo, null);
            (window as any)["com.mendix.widgets.web.filterable.filterContext.v2"] = createContext<FilterAPIv2>(
                headerFilterStore.context
            );
        });

        it("has correct short week days for en-US", async () => {
            window.mx = createMXObjectMock("en_US", "en-US");
            render(<DatagridDateFilter {...commonProps} defaultValue={dynamicValue(new Date("2021-12-10"))} />);

            const input = screen.getByRole("textbox");
            await act(async () => {
                fireEvent.click(input);
            });
            const header = screen.getByText(/december 2021/i).parentElement?.lastChild;
            expect(header?.textContent).toEqual("SuMoTuWeThFrSa");
        });

        it("has correct short week days for en-US and starts week at Monday", async () => {
            window.mx = createMXObjectMock("en_US", "en-US", 1);
            render(<DatagridDateFilter {...commonProps} defaultValue={dynamicValue(new Date("2021-12-10"))} />);

            const input = screen.getByRole("textbox");
            await act(async () => {
                fireEvent.click(input);
            });
            const header = screen.getByText(/december 2021/i).parentElement?.lastChild;
            expect(header?.textContent).toEqual("MoTuWeThFrSaSu");
        });

        it("has correct short week days for pt-Br", async () => {
            window.mx = createMXObjectMock("pt_BR", "pt-BR");
            render(<DatagridDateFilter {...commonProps} defaultValue={dynamicValue(new Date("2021-12-10"))} />);

            const input = screen.getByRole("textbox");
            await act(async () => {
                fireEvent.click(input);
            });
            const header = screen.getByText(/dezembro 2021/i).parentElement?.lastChild;
            expect(header?.textContent).toEqual("domsegterquaquisexsab");
        });

        it("has correct short week days for fi-FI and starts on monday", async () => {
            window.mx = createMXObjectMock("fi_FI", "fi-FI", 1);
            render(<DatagridDateFilter {...commonProps} defaultValue={dynamicValue(new Date("2021-12-10"))} />);

            const input = screen.getByRole("textbox");
            await act(async () => {
                fireEvent.click(input);
            });
            const header = screen.getByText(/joulukuu 2021/i).parentElement?.lastChild;
            expect(header?.textContent).toEqual("matiketopelasu");
        });

        it("has correct short week days for fi-FI", async () => {
            window.mx = createMXObjectMock("fi_FI", "fi-FI");
            render(<DatagridDateFilter {...commonProps} defaultValue={dynamicValue(new Date("2021-12-10"))} />);

            const input = screen.getByRole("textbox");
            await act(async () => {
                fireEvent.click(input);
            });
            const header = screen.getByText(/joulukuu 2021/i).parentElement?.lastChild;
            expect(header?.textContent).toEqual("sumatiketopela");
        });
    });
});
