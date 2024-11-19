import "@testing-library/jest-dom";
import { FilterAPIv2 } from "@mendix/widget-plugin-filtering/context";
import { HeaderFiltersStore, HeaderFiltersStoreProps } from "@mendix/widget-plugin-filtering/stores/HeaderFiltersStore";
import { dynamic, EditableValueBuilder, ListAttributeValueBuilder } from "@mendix/widget-plugin-test-utils";
import { render, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createContext, createElement } from "react";

import { requirePlugin } from "@mendix/widget-plugin-external-events/plugin";

import DatagridNumberFilter from "../../DatagridNumberFilter";
import { Big } from "big.js";
import { DatagridNumberFilterContainerProps } from "../../../typings/DatagridNumberFilterProps";

export interface StaticInfo {
    name: string;
    filtersChannelName: string;
}

const commonProps: DatagridNumberFilterContainerProps = {
    class: "filter-custom-class",
    tabIndex: 0,
    name: "filter-test",
    defaultFilter: "equal" as const,
    adjustable: true,
    advanced: false,
    delay: 1000
};

const headerFilterStoreInfo: StaticInfo = {
    name: commonProps.name,
    filtersChannelName: "datagrid1"
};

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
                                .withType("AutoNumber")
                                .withFormatter(
                                    value => (value ? value.toString() : ""),
                                    (value: string) => ({ valid: true, value })
                                )
                                .withFilterable(true)
                                .build()
                        }
                    ],
                    parentChannelName: headerFilterStoreInfo.filtersChannelName
                };
                const headerFilterStore = new HeaderFiltersStore(props, headerFilterStoreInfo, null);
                if (headerFilterStore.context.provider.hasError) {
                    throw new Error("Error in provider");
                }
                (window as any)["com.mendix.widgets.web.filterable.filterContext.v2"] = createContext<FilterAPIv2>(
                    headerFilterStore.context
                );
            });

            it("clears value when reset event is triggered with a default value", async () => {
                const attribute = new EditableValueBuilder<Big>().build();
                const value = dynamic<Big>(Big(123));
                const { asFragment, getByRole } = render(
                    <DatagridNumberFilter {...commonProps} valueAttribute={attribute} defaultValue={value} />
                );
                expect(asFragment()).toMatchSnapshot();
                // First set a value
                const input = getByRole("spinbutton");
                expect(input).toHaveValue(123);
                const user = userEvent.setup();
                // set input empty
                await user.clear(input);
                await user.type(input, "42");
                await waitFor(
                    () => {
                        expect(attribute.setValue).toHaveBeenLastCalledWith(Big(42));
                    },
                    { timeout: 1200 }
                );

                // Trigger reset event
                const plugin = requirePlugin();
                act(() => {
                    plugin.emit(commonProps.name, "reset.filters", true);
                    plugin.emit("datagrid1", "reset.filters", true);
                    plugin.emit(commonProps.name, "reset.value", true);
                    plugin.emit("datagrid1", "reset.value", true);
                });
                // console.log("input", input);
                await waitFor(() => {
                    expect(getByRole("spinbutton")).toHaveValue(123);
                });
                // expect(attribute.setValue).toHaveBeenCalledWith(undefined);
            });

            // describe("with defaultValue", () => {
            //     it("initializes with defaultValue", () => {
            //         render(<DatagridNumberFilter {...commonProps} defaultValue={dynamicValue<Big>(new Big(100))} />);
            //         expect(screen.getByRole("spinbutton")).toHaveValue(100);
            //     });
            //     it("do not sync value and defaultValue when defaultValue changes from undefined to number", () => {
            //         const { rerender } = render(<DatagridNumberFilter {...commonProps} defaultValue={undefined} />);
            //         expect(screen.getByRole("spinbutton")).toHaveValue(null);
            //         rerender(<DatagridNumberFilter {...commonProps} defaultValue={dynamicValue<Big>(new Big(100))} />);
            //         expect(screen.getByRole("spinbutton")).toHaveValue(null);
            //     });
            //     it("do not sync value and defaultValue when defaultValue changes from number to undefined", async () => {
            //         const { rerender } = render(
            //             <DatagridNumberFilter {...commonProps} defaultValue={dynamicValue<Big>(new Big(100))} />
            //         );
            //         expect(screen.getByRole("spinbutton")).toHaveValue(100);
            //         rerender(<DatagridNumberFilter {...commonProps} defaultValue={undefined} />);
            //         await waitFor(() => {
            //             expect(screen.getByRole("spinbutton")).toHaveValue(100);
            //         });
            //     });
            // });

            afterAll(() => {
                (window as any)["com.mendix.widgets.web.filterable.filterContext.v2"] = undefined;
            });
        });
    });
});
