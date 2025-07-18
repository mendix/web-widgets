import { getGlobalSortContext, SortAPI } from "@mendix/widget-plugin-sorting/react/context";
import { SortStoreHost } from "@mendix/widget-plugin-sorting/stores/SortStoreHost";
import { attrId, dynamicValue, ListAttributeValueBuilder } from "@mendix/widget-plugin-test-utils";
import { fireEvent, render } from "@testing-library/react";
import React, { createElement } from "react";
import { AttributesType, DropdownSortContainerProps } from "../../../typings/DropdownSortProps";
import { DropdownSort } from "../../DropdownSort";

const commonProps: DropdownSortContainerProps = {
    class: "filter-custom-class",
    tabIndex: 0,
    name: "test-key",
    attributes: []
};

const createAPI = (observer: SortStoreHost): SortAPI => ({
    version: 1,
    host: observer
});

const mockAttributes = (): AttributesType[] => [
    {
        attribute: new ListAttributeValueBuilder().withId(attrId("1")).withType("String").withSortable(true).build(),
        caption: dynamicValue<string>("Option 1")
    },
    {
        attribute: new ListAttributeValueBuilder().withId(attrId("2")).withType("Decimal").withSortable(true).build(),
        caption: dynamicValue<string>("Option 2")
    }
];

function renderWithSortAPI(elt: React.ReactElement, api: SortAPI): ReturnType<typeof render> {
    const SortAPI = getGlobalSortContext();
    return render(<SortAPI.Provider value={api}>{elt}</SortAPI.Provider>);
}

describe("Dropdown Sort", () => {
    describe("with single instance", () => {
        beforeEach(() => {
            delete (global as any)["com.mendix.widgets.web.UUID"];
        });

        describe("with correct context", () => {
            let attributes: DropdownSortContainerProps["attributes"];
            let api: SortAPI;
            beforeEach(() => {
                const host = new SortStoreHost({
                    initSort: [[attrId("1"), "asc"]]
                });
                api = createAPI(host);
                attributes = mockAttributes();
            });
            it("loads correct values from attributes", () => {
                expect(attributes.length).toBe(2);
                const filter = renderWithSortAPI(<DropdownSort {...commonProps} attributes={attributes} />, api);
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
                const { asFragment } = renderWithSortAPI(
                    <DropdownSort {...commonProps} attributes={attributes} />,
                    api
                );
                expect(asFragment()).toMatchSnapshot();
            });
        });

        describe("with view state", () => {
            let attributes: DropdownSortContainerProps["attributes"];
            let api: SortAPI;
            beforeEach(() => {
                const host = new SortStoreHost({
                    initSort: [[attrId("1"), "asc"]]
                });
                api = createAPI(host);
                attributes = mockAttributes();
            });
            it("loads correct default option", () => {
                const filter = renderWithSortAPI(<DropdownSort {...commonProps} attributes={attributes} />, api);
                fireEvent.click(filter.getByRole("textbox"));

                expect(filter.getByRole("textbox").getAttribute("value")).toStrictEqual("Option 1");
            });
        });

        describe("with no context", () => {
            beforeAll(() => {
                (window as any)["com.mendix.widgets.web.sortable.sortContext"] = undefined;
            });

            it("renders error message", () => {
                jest.spyOn(console, "error").mockImplementation(() => {});
                const filter = render(<DropdownSort {...commonProps} />);
                expect(filter.container.querySelector(".alert")?.textContent).toBe(
                    "Error: widget is out of context. Please place the widget inside the Gallery header."
                );
            });
        });
    });

    describe("with multiple instances", () => {
        let attributes: DropdownSortContainerProps["attributes"];
        let api: SortAPI;
        beforeEach(() => {
            delete (global as any)["com.mendix.widgets.web.UUID"];
            const host = new SortStoreHost({
                initSort: [[attrId("1"), "asc"]]
            });
            api = createAPI(host);
            attributes = mockAttributes();
        });

        it("renders with a unique id", () => {
            const { asFragment: fragment1 } = renderWithSortAPI(
                <DropdownSort {...commonProps} attributes={attributes} />,
                api
            );
            const { asFragment: fragment2 } = renderWithSortAPI(
                <DropdownSort {...commonProps} attributes={attributes} />,
                api
            );

            expect(fragment1().querySelector("input")?.getAttribute("aria-controls")).not.toBe(
                fragment2().querySelector("input")?.getAttribute("aria-controls")
            );
        });
    });
});
