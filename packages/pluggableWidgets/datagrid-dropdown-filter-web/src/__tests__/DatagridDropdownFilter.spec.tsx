import { EnumFilterStore } from "@mendix/widget-plugin-dropdown-filter/stores/EnumFilterStore";
import { FilterAPI } from "@mendix/widget-plugin-filtering/context";
import { ObservableFilterHost } from "@mendix/widget-plugin-filtering/typings/ObservableFilterHost";
import { dynamicValue, listAttribute } from "@mendix/widget-plugin-test-utils";
import "@testing-library/jest-dom";
import { render, waitFor } from "@testing-library/react";
import { AssociationMetaData, AttributeMetaData } from "mendix";
import { createContext } from "react";
import { DatagridDropdownFilterContainerProps } from "../../typings/DatagridDropdownFilterProps";
import DatagridDropdownFilter from "../DatagridDropdownFilter";

const commonProps: DatagridDropdownFilterContainerProps = {
    class: "filter-custom-class",
    tabIndex: 0,
    name: "filter-test",
    attrChoice: "auto",
    baseType: "attr",
    attr: undefined as unknown as AttributeMetaData<string | boolean>,
    auto: false,
    filterOptions: [],
    refEntity: undefined as unknown as AssociationMetaData,
    fetchOptionsLazy: false,
    filterable: false,
    multiSelect: false,
    clearable: false,
    emptySelectionCaption: dynamicValue("Select"),
    emptyOptionCaption: dynamicValue("None"),
    ariaLabel: dynamicValue("AriaLabel"),
    selectedItemsStyle: "text",
    selectionMethod: "checkbox",
    refCaptionSource: "attr"
};

describe("Dropdown Filter", () => {
    describe("with single instance", () => {
        describe("with single attribute", () => {
            beforeEach(() => {
                const attribute = listAttribute<string>(() => "a");
                attribute.type = "Enum";
                attribute.universe = ["a", "b", "c"];

                const filterAPI: FilterAPI = {
                    version: 3,
                    parentChannelName: "datagrid/1",
                    provider: {
                        hasError: false,
                        value: { type: "direct", store: new EnumFilterStore([attribute], null) }
                    },
                    filterObserver: {} as ObservableFilterHost
                };
                (window as any)["com.mendix.widgets.web.filterable.filterContext.v2"] = createContext<FilterAPI | null>(
                    filterAPI
                );
            });

            it("renders correctly", async () => {
                const { asFragment, getByRole } = render(<DatagridDropdownFilter {...commonProps} />);
                await waitFor(() => getByRole("combobox"));
                expect(asFragment()).toMatchSnapshot();
            });

            afterAll(() => {
                (window as any)["com.mendix.widgets.web.filterable.filterContext.v2"] = undefined;
            });
        });
    });
});
