import { FilterAPIv2 } from "@mendix/widget-plugin-filtering/context";
import {
    HeaderFiltersStore,
    HeaderFiltersStoreProps
} from "@mendix/widget-plugin-filtering/stores/generic/HeaderFiltersStore";
import { SortAPI } from "@mendix/widget-plugin-sorting/context";
import { SortAPIProvider, SortListType } from "@mendix/widget-plugin-sorting/providers/SortAPIProvider";
import { ListAttributeId } from "@mendix/widget-plugin-sorting/typings";
import { ListAttributeValueBuilder, dynamicValue } from "@mendix/widget-plugin-test-utils";
import { fireEvent, render } from "@testing-library/react";
import { ListValue } from "mendix";
import { createContext, createElement } from "react";
import { DropdownSortContainerProps } from "../../../typings/DropdownSortProps";
import { DropdownSort } from "../../DropdownSort";

const commonProps: DropdownSortContainerProps = {
    class: "filter-custom-class",
    tabIndex: 0,
    name: "filter-test"
};

export interface StaticInfo {
    name: string;
    filtersChannelName: string;
}

const headerFilterStoreInfo: StaticInfo = {
    name: commonProps.name,
    filtersChannelName: ""
};

// CONTEXT
const props: HeaderFiltersStoreProps = {
    filterList: []
};
const headerFilterStore = new HeaderFiltersStore(props, headerFilterStoreInfo, null);
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
            it("loads correct values from attributes", () => {
                const filter = render(<DropdownSort {...commonProps} />);
                fireEvent.click(filter.getByRole("textbox"));

                const items = filter.getAllByRole("menuitem");

                items.forEach((item, index) => {
                    if (index === 0) {
                        return;
                    }
                    expect(item.textContent).toBe(`Option ${index}`);
                });
            });

            it("renders correctly", () => {
                const { asFragment } = render(<DropdownSort {...commonProps} />);
                expect(asFragment()).toMatchSnapshot();
            });
        });

        describe("with view state", () => {
            it("loads correct default option", () => {
                const filter = render(<DropdownSort {...commonProps} />);
                fireEvent.click(filter.getByRole("textbox"));

                expect(filter.getByRole("textbox").getAttribute("value")).toStrictEqual("Option 1");
            });
        });

        describe("with no context", () => {
            beforeAll(() => {
                (window as any)["com.mendix.widgets.web.sortable.sortContext"] = undefined;
            });

            it("renders error message", () => {
                const filter = render(<DropdownSort {...commonProps} />);
                expect(filter.container.querySelector(".alert")?.textContent).toBe("Out of context");
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
