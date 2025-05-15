import { ListAttributeValue, ListValue } from "mendix";
import { SortAPI } from "@mendix/widget-plugin-sorting/context";
import { ListAttributeValueBuilder, dynamicValue } from "@mendix/widget-plugin-test-utils";
import { fireEvent, render } from "@testing-library/react";
import { createContext, createElement } from "react";
import { DropdownSortContainerProps } from "../../../typings/DropdownSortProps";
import { DropdownSort } from "../../DropdownSort";
import { SortStoreProvider } from "@mendix/widget-plugin-sorting/controllers/SortStoreProvider";
import { SortStoreHost } from "@mendix/widget-plugin-sorting/controllers/SortStoreHost";

const commonProps: DropdownSortContainerProps = {
    class: "filter-custom-class",
    tabIndex: 0,
    name: "filter-test",
    attributes: []
};

const sortList = [
    {
        attribute: new ListAttributeValueBuilder().withId("attribute1").withType("String").withSortable(true).build(),
        caption: dynamicValue<string>("Option 1")
    },
    {
        attribute: new ListAttributeValueBuilder().withId("attribute2").withType("Decimal").withSortable(true).build(),
        caption: dynamicValue<string>("Option 2")
    }
];

const sortProvider = new SortStoreProvider(new SortStoreHost(), {
    name: "filter-test",
    options: sortList
});

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
