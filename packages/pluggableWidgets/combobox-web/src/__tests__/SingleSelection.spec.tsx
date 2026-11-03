import "@testing-library/jest-dom";
jest.mock("../hooks/useFloatingMenu");
import { act, fireEvent, render, RenderResult, waitFor } from "@testing-library/react";
import { resetIdCounter } from "downshift";
import { ListValue } from "mendix";
import {
    dynamic,
    EditableValueBuilder,
    list,
    ListAttributeValueBuilder,
    listExpression,
    obj,
    ReferenceValueBuilder,
    setupIntersectionObserverStub
} from "@mendix/widget-plugin-test-utils";
import { ComboboxContainerProps } from "../../typings/ComboboxProps";
import Combobox from "../Combobox";

// function helper to ease DOM changes in development
async function getToggleButton(component: RenderResult): Promise<Element> {
    return component.container.querySelector(".widget-combobox-down-arrow")!;
}
async function getInput(component: RenderResult): Promise<HTMLInputElement> {
    return (await component.findByRole("combobox")) as HTMLInputElement;
}
async function getVisibleValueNode(component: RenderResult): Promise<HTMLDivElement> {
    const custom = component.container.querySelector(".widget-combobox-placeholder-custom") as HTMLDivElement;
    const text = component.container.querySelector(".widget-combobox-placeholder-text") as HTMLDivElement;

    return custom ?? text;
}

describe("Combo box (Association)", () => {
    beforeAll(() => {
        setupIntersectionObserverStub();
    });
    let defaultProps: ComboboxContainerProps;
    beforeEach(() => {
        resetIdCounter();
        defaultProps = {
            name: "comboBox",
            id: "comboBox1",
            source: "context",
            optionsSourceType: "association",
            attributeAssociation: new ReferenceValueBuilder().withValue(obj("111")).build(),
            attributeEnumeration: new EditableValueBuilder<string>().build(),
            attributeBoolean: new EditableValueBuilder<boolean>().build(),
            optionsSourceAssociationDataSource: list([obj("111"), obj("222"), obj("333"), obj("444")]),
            optionsSourceAssociationCaptionType: "expression",
            optionsSourceAssociationCaptionAttribute: new ListAttributeValueBuilder<string>().build(),
            optionsSourceAssociationCaptionExpression: listExpression(() => "$currentObject/CountryName"),
            optionsSourceAssociationCustomContentType: "no",
            optionsSourceAssociationCustomContent: undefined,
            emptyOptionText: dynamic.available("Select an option 111"),
            ariaRequired: dynamic.available(true),
            clearable: true,
            filterType: "contains",
            selectedItemsStyle: "text",
            readOnlyStyle: "bordered",
            lazyLoading: false,
            loadingType: "spinner",
            clearButtonAriaLabel: dynamic.available("Clear selection"),
            removeValueAriaLabel: dynamic.available("Remove value"),
            selectAllButtonCaption: dynamic.available("Select All"),
            selectAllButton: false,
            selectionMethod: "checkbox",
            a11ySelectedValue: dynamic.available("Selected value:"),
            a11yOptionsAvailable: dynamic.available("Options available:"),
            a11yInstructions: dynamic.available("a11yInstructions"),
            showFooter: false,
            databaseAttributeString: new EditableValueBuilder<string | Big>().build(),
            optionsSourceDatabaseCaptionType: "attribute",
            optionsSourceDatabaseCustomContentType: "yes",
            staticDataSourceCustomContentType: "no",
            staticAttribute: new EditableValueBuilder<string>().build(),
            optionsSourceStaticDataSource: [
                {
                    staticDataSourceValue: dynamic.available("value1"),
                    staticDataSourceCustomContent: undefined,
                    staticDataSourceCaption: dynamic.available("caption1")
                },
                {
                    staticDataSourceValue: dynamic.available("value2"),
                    staticDataSourceCustomContent: undefined,
                    staticDataSourceCaption: dynamic.available("caption2")
                }
            ],
            selectedItemsSorting: "none",
            customEditability: "default",
            customEditabilityExpression: dynamic.available(false),
            filterInputDebounceInterval: 200
        };
        if (defaultProps.optionsSourceAssociationCaptionType === "expression") {
            defaultProps.optionsSourceAssociationCaptionExpression!.get = i => dynamic.available(`${i.id}`);
        }
    });
    it("renders combobox widget", () => {
        const component = render(<Combobox {...defaultProps} />);
        expect(component.container).toMatchSnapshot();
    });
    it("renders placeholder component in case of unavailable status", () => {
        defaultProps.attributeAssociation = new ReferenceValueBuilder().isUnavailable().build();
        const { container } = render(<Combobox {...defaultProps} />);
        expect(container.getElementsByClassName("widget-combobox-placeholder")).toHaveLength(1);
    });
    it("toggles combobox menu on: input TOGGLE BUTTON", async () => {
        const component = render(<Combobox {...defaultProps} />);
        const toggleButton = await getToggleButton(component);
        await act(() => {
            fireEvent.click(toggleButton);
        });
        await waitFor(() => {
            expect(component.getAllByRole("option")).toHaveLength(4);
            fireEvent.click(toggleButton);
        });
        expect(component.queryAllByRole("option")).toHaveLength(0);
    });
    it("positions the open menu via floating-ui (applies floatingStyles to the menu)", async () => {
        const component = render(<Combobox {...defaultProps} />);
        const toggleButton = await getToggleButton(component);
        await act(() => {
            fireEvent.click(toggleButton);
        });
        await waitFor(() => {
            expect(component.getAllByRole("option")).toHaveLength(4);
        });
        const menu = component.container.querySelector(".widget-combobox-menu") as HTMLElement;
        expect(menu.style.getPropertyValue("--this-is-mocked-from-unit-tests")).toEqual("true");
    });
    it("sets option to selected item", async () => {
        const component = render(<Combobox {...defaultProps} />);
        const value = await getVisibleValueNode(component);
        const toggleButton = await getToggleButton(component);
        fireEvent.click(toggleButton);
        const option1 = await component.findByText("obj_222");
        fireEvent.click(option1);
        component.rerender(<Combobox {...defaultProps} />);
        expect(value.textContent).toEqual("obj_222");
        expect(defaultProps.attributeAssociation?.setValue).toHaveBeenCalled();
        expect(component.queryAllByRole("option")).toHaveLength(0);
        expect(defaultProps.attributeAssociation?.value).toEqual({ id: "obj_222" });
    });
    it("removes selected item", async () => {
        const component = render(<Combobox {...defaultProps} />);

        const toggleButton = await getToggleButton(component);
        fireEvent.click(toggleButton);

        const option1 = await component.findByText("obj_222");
        fireEvent.click(option1);

        component.rerender(<Combobox {...defaultProps} />);

        const value = await getVisibleValueNode(component);
        expect(value.textContent).toEqual("obj_222");
        expect(defaultProps.attributeAssociation?.setValue).toHaveBeenCalled();
        expect(component.queryAllByRole("option")).toHaveLength(0);
        expect(defaultProps.attributeAssociation?.value).toEqual({ id: "obj_222" });

        const clearButton = await component.container.getElementsByClassName("widget-combobox-clear-button")[0];
        fireEvent.click(clearButton);

        component.rerender(<Combobox {...defaultProps} />);

        const labelText = await component.container.querySelector(
            ".widget-combobox-placeholder-text .widget-combobox-caption-text"
        );
        expect(labelText?.innerHTML).toEqual(defaultProps.emptyOptionText?.value);
        expect(defaultProps.attributeAssociation?.value).toEqual(undefined);
    });

    describe("with lazy loading", () => {
        it("calls loadMore only when menu opens", async () => {
            const setLimit = jest.fn();
            const lazyLoadingProps: ComboboxContainerProps = {
                ...defaultProps,
                lazyLoading: true,
                optionsSourceAssociationCaptionType: "attribute",
                optionsSourceAssociationDataSource: {
                    ...defaultProps.optionsSourceAssociationDataSource,
                    hasMoreItems: true,
                    limit: 0,
                    setLimit
                } as ListValue
            };
            const component = render(<Combobox {...lazyLoadingProps} />);

            expect(component.queryAllByRole("option")).toHaveLength(0);
            expect(lazyLoadingProps.optionsSourceAssociationDataSource?.limit).toEqual(0);

            const input = await getInput(component);
            fireEvent.click(input);

            await waitFor(() => {
                expect(component.queryAllByRole("option")).toHaveLength(4);
                expect(setLimit).toHaveBeenCalledWith(100);
            });
        });
    });

    describe("typed text, highlight and menu state", () => {
        // The state reducer in useDownshiftSingleSelectProps decides what the typed text, the
        // highlight and the menu do on each event. These cases pin that behaviour at the DOM.
        async function open(component: RenderResult): Promise<HTMLInputElement> {
            const input = await getInput(component);
            fireEvent.click(input);
            await waitFor(() => {
                expect(component.getAllByRole("option")).toHaveLength(4);
            });
            return input;
        }

        function highlighted(component: RenderResult): string | undefined {
            return component.container.querySelector(".widget-combobox-item-highlighted")?.textContent ?? undefined;
        }

        function type(input: HTMLInputElement, value: string): void {
            fireEvent.change(input, { target: { value } });
        }

        it("drops the typed text and the filter when the user leaves the widget", async () => {
            const component = render(<Combobox {...defaultProps} />);
            const input = await open(component);
            type(input, "222");
            await waitFor(() => {
                expect(component.getAllByRole("option")).toHaveLength(1);
            });

            fireEvent.blur(input);

            expect(component.queryAllByRole("option")).toHaveLength(0);
            expect(input.value).toBe("");
            fireEvent.click(input);
            await waitFor(() => {
                expect(component.getAllByRole("option")).toHaveLength(4);
            });
        });

        it("drops the typed text when the toggle button closes the menu", async () => {
            const component = render(<Combobox {...defaultProps} />);
            const input = await open(component);
            type(input, "222");

            fireEvent.click(await getToggleButton(component));

            expect(component.queryAllByRole("option")).toHaveLength(0);
            expect(input.value).toBe("");
        });

        it("keeps the input empty after a keyboard selection and shows the caption next to it", async () => {
            const component = render(<Combobox {...defaultProps} />);
            const input = await open(component);
            fireEvent.keyDown(input, { key: "ArrowDown" });
            expect(highlighted(component)).toBe("obj_222");

            fireEvent.keyDown(input, { key: "Enter" });
            component.rerender(<Combobox {...defaultProps} />);

            expect(defaultProps.attributeAssociation?.setValue).toHaveBeenCalledWith({ id: "obj_222" });
            expect(component.queryAllByRole("option")).toHaveLength(0);
            expect(input.value).toBe("");
            expect((await getVisibleValueNode(component)).textContent).toBe("obj_222");
        });

        it("Escape closes the menu, drops the typed text and keeps the selection", async () => {
            const component = render(<Combobox {...defaultProps} />);
            const input = await open(component);
            type(input, "222");

            fireEvent.keyDown(input, { key: "Escape" });

            expect(component.queryAllByRole("option")).toHaveLength(0);
            expect(input.value).toBe("");
            expect((await getVisibleValueNode(component)).textContent).toBe("obj_111");
            expect(defaultProps.attributeAssociation?.setValue).not.toHaveBeenCalled();

            // downshift clears the selection on Escape over a closed menu; the reducer keeps it.
            fireEvent.keyDown(input, { key: "Escape" });
            expect(defaultProps.attributeAssociation?.setValue).not.toHaveBeenCalled();
        });

        it("focus keeps the menu closed", async () => {
            const component = render(<Combobox {...defaultProps} />);
            const input = await getInput(component);

            fireEvent.focus(input);

            expect(component.queryAllByRole("option")).toHaveLength(0);
        });

        it("Backspace in the empty input clears the selection when clearable", async () => {
            const component = render(<Combobox {...defaultProps} />);
            const input = await getInput(component);

            fireEvent.keyDown(input, { key: "Backspace" });

            expect(defaultProps.attributeAssociation?.setValue).toHaveBeenCalledWith(undefined);
        });

        it("Backspace in the empty input keeps the selection when not clearable", async () => {
            const component = render(<Combobox {...defaultProps} clearable={false} />);
            const input = await getInput(component);

            fireEvent.keyDown(input, { key: "Backspace" });

            expect(defaultProps.attributeAssociation?.setValue).not.toHaveBeenCalled();
        });
    });
});
