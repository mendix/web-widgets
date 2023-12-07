import {
    buildListExpression,
    dynamicValue,
    EditableValueBuilder,
    ListAttributeValueBuilder,
    ListValueBuilder,
    ReferenceSetValueBuilder
} from "@mendix/widget-plugin-test-utils";
import "@testing-library/jest-dom";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { ObjectItem, DynamicValue } from "mendix";
import { createElement } from "react";
import { ComboboxContainerProps } from "../../typings/ComboboxProps";
import Combobox from "../Combobox";

describe("Combo box (Association)", () => {
    let defaultProps: ComboboxContainerProps;
    beforeEach(() => {
        defaultProps = {
            name: "comboBox",
            id: "comboBox1",
            optionsSourceType: "association",
            attributeAssociation: new ReferenceSetValueBuilder().withValue([{ id: "111" }] as ObjectItem[]).build(),
            attributeEnumeration: new EditableValueBuilder<string>().build(),
            attributeBoolean: new EditableValueBuilder<boolean>().build(),
            optionsSourceAssociationDataSource: ListValueBuilder().withItems([
                { id: "111" },
                { id: "222" },
                { id: "333" },
                { id: "444" }
            ] as ObjectItem[]),
            optionsSourceAssociationCaptionType: "expression",
            optionsSourceAssociationCaptionAttribute: new ListAttributeValueBuilder<string>().build(),
            optionsSourceAssociationCaptionExpression: buildListExpression("$currentObject/CountryName"),
            optionsSourceAssociationCustomContentType: "no",
            optionsSourceAssociationCustomContent: undefined,
            emptyOptionText: dynamicValue("Select an option 111"),
            ariaRequired: true,
            clearable: true,
            filterType: "contains",
            selectedItemsStyle: "text",
            noOptionsText: dynamicValue("no options found"),
            clearButtonAriaLabel: dynamicValue("Clear selection"),
            removeValueAriaLabel: dynamicValue("Remove value"),
            selectionMethod: "checkbox",
            a11ySelectedValue: dynamicValue("Selected value:"),
            a11yOptionsAvailable: dynamicValue("Options available:"),
            a11yInstructions: dynamicValue("a11yInstructions"),
            showFooter: false
        };
        if (defaultProps.optionsSourceAssociationCaptionType === "expression") {
            defaultProps.optionsSourceAssociationCaptionExpression!.get = i => {
                return {
                    value: `${i.id}`,
                    status: "available"
                } as DynamicValue<string>;
            };
        }
    });

    it("renders combobox widget", () => {
        const component = render(<Combobox {...defaultProps} />);
        expect(component.container).toMatchSnapshot();
    });
    it("renders placeholder component in case of unavailable status", () => {
        defaultProps.attributeAssociation = new ReferenceSetValueBuilder().isUnavailable().build();
        const { container } = render(<Combobox {...defaultProps} />);
        expect(container.getElementsByClassName("widget-combobox-placeholder")).toHaveLength(1);
    });
    it("toggles combobox menu on: input CLICK(focus) / BLUR", async () => {
        const component = render(<Combobox {...defaultProps} />);
        const toggleButton = await component.findByRole("combobox");
        await fireEvent.click(toggleButton);
        await waitFor(() => {
            expect(component.getAllByRole("option")).toHaveLength(4);
        });
        fireEvent.blur(toggleButton);
        expect(component.queryAllByRole("option")).toHaveLength(0);
    });
    it("toggles combobox menu on: input TOGGLE BUTTON", async () => {
        const component = render(<Combobox {...defaultProps} />);
        const toggleButton = await component.container.querySelector(".widget-combobox-down-arrow")!;

        fireEvent.click(toggleButton);
        waitFor(() => {
            expect(component.getAllByRole("option")).toHaveLength(4);
        });
        fireEvent.click(toggleButton);
        expect(component.queryAllByRole("option")).toHaveLength(0);
    });
    it("adds new item to inital selected item", async () => {
        const component = render(<Combobox {...defaultProps} />);
        const input = (await component.findByRole("combobox")) as HTMLInputElement;

        fireEvent.click(input);
        waitFor(() => {
            expect(component.queryAllByRole("option")).toHaveLength(4);
        });
        const option1 = await component.findByText("222");
        fireEvent.click(option1);
        expect(defaultProps.attributeAssociation?.setValue).toBeCalled();
        expect(defaultProps.attributeAssociation?.value).toEqual([{ id: "111" }, { id: "222" }]);
    });
    it("removes selected item", async () => {
        const component = render(<Combobox {...defaultProps} />);
        const input = (await component.findByRole("combobox")) as HTMLInputElement;
        fireEvent.click(input);
        await waitFor(() => {
            expect(component.queryAllByRole("option")).toHaveLength(4);
        });
        const option1 = await component.findByText("222");
        fireEvent.click(option1);
        expect(defaultProps.attributeAssociation?.setValue).toBeCalled();
        expect(defaultProps.attributeAssociation?.value).toEqual([{ id: "111" }, { id: "222" }]);

        const clearButton = await component.container.getElementsByClassName("widget-combobox-clear-button")[0];
        fireEvent.click(clearButton);
        expect(defaultProps.attributeAssociation?.value).toEqual([]);
    });
});
