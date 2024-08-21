import { Alert } from "@mendix/widget-plugin-component-kit/Alert";
import { FilterAPIv2 } from "@mendix/widget-plugin-filtering/context";
import { HeaderFiltersStore, HeaderFiltersStoreProps } from "@mendix/widget-plugin-filtering/stores/HeaderFiltersStore";
import { SortAPI } from "@mendix/widget-plugin-sorting/context";
import { SortAPIProvider, SortListType } from "@mendix/widget-plugin-sorting/providers/SortAPIProvider";
import { ListAttributeId } from "@mendix/widget-plugin-sorting/typings";
import { ListAttributeValueBuilder, dynamicValue } from "@mendix/widget-plugin-test-utils";
import { render } from "@testing-library/react";
import { mount } from "enzyme";
import { ListValue } from "mendix";
import { createContext, createElement } from "react";
import { DropdownSortContainerProps } from "../../../typings/DropdownSortProps";
import { DropdownSort } from "../../DropdownSort";
import { SortComponent } from "../SortComponent";

const commonProps: DropdownSortContainerProps = {
    class: "filter-custom-class",
    tabIndex: 0,
    name: "filter-test"
};

// CONTEXT
const props: HeaderFiltersStoreProps = {
    enableFilterGroups: true,
    filterList: [],
    groupAttrs: [],
    groupList: []
};
const headerFilterStore = new HeaderFiltersStore(props, null);
(window as any)["com.mendix.widgets.web.filterable.filterContext.v2"] = createContext<FilterAPIv2>(
    headerFilterStore.context
);

const sortList: SortListType[] = [
    {
        attribute: new ListAttributeValueBuilder().withId("attribute1").withType("String").withSortable(true).build(),
        caption: dynamicValue<string>("Option 1")
    },
    {
        attribute: new ListAttributeValueBuilder().withId("attribute2").withType("Decimal").withSortable(true).build(),
        caption: dynamicValue<string>("Option 2")
    }
];
const sortProvider = new SortAPIProvider({
    datasource: { sortOrder: [[sortList[0].attribute.id as ListAttributeId, "asc"]] } as ListValue,
    sortList
});
(window as any)["com.mendix.widgets.web.sortable.sortContext"] = createContext<SortAPI>(sortProvider.context);
// END CONTEXT

describe("Dropdown Sort", () => {
    describe("with single instance", () => {
        afterEach(() => {
            delete (global as any)["com.mendix.widgets.web.UUID"];
        });

        describe("with correct context", () => {
            beforeAll(() => {});
            it("loads correct values from attributes", () => {
                const filter = mount(<DropdownSort {...commonProps} />);
                expect(filter.find(SortComponent).prop("options")).toStrictEqual([
                    {
                        caption: "",
                        value: null
                    },
                    {
                        caption: "Option 1",
                        value: "attribute1"
                    },
                    {
                        caption: "Option 2",
                        value: "attribute2"
                    }
                ]);
            });

            it("renders correctly", () => {
                const { asFragment } = render(<DropdownSort {...commonProps} />);
                expect(asFragment()).toMatchSnapshot();
            });
        });

        describe("with view state", () => {
            it("loads correct default option", () => {
                const filter = mount(<DropdownSort {...commonProps} />);
                expect(filter.find(SortComponent).prop("value")).toStrictEqual("attribute1");
            });
        });

        describe("with no context", () => {
            beforeAll(() => {
                (window as any)["com.mendix.widgets.web.sortable.sortContext"] = undefined;
            });

            it("renders error message", () => {
                const filter = mount(<DropdownSort {...commonProps} />);
                expect(filter.find(Alert).text()).toBe("Out of context");
            });
        });
    });

    describe("with multiple instances", () => {
        beforeAll(() => {
            (window as any)["com.mendix.widgets.web.sortable.sortContext"] = createContext<SortAPI>(
                sortProvider.context
            );
        });

        it("renders with a unique id", () => {
            const { asFragment: fragment1 } = render(<DropdownSort {...commonProps} />);
            const { asFragment: fragment2 } = render(<DropdownSort {...commonProps} />);

            expect(fragment1().querySelector("input")?.getAttribute("aria-controls")).not.toBe(
                fragment2().querySelector("input")?.getAttribute("aria-controls")
            );
        });

        afterAll(() => {
            (window as any)["com.mendix.widgets.web.sortable.sortContext"] = undefined;
            delete (global as any)["com.mendix.widgets.web.UUID"];
        });
    });
});
