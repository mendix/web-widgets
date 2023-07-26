import {
    buildListExpression,
    dynamicValue,
    EditableValueBuilder,
    ListAttributeValueBuilder,
    ListValueBuilder,
    ReferenceValueBuilder
} from "@mendix/pluggable-test-utils";
import "@testing-library/jest-dom";
import { fireEvent, render } from "@testing-library/react";
import { ObjectItem, DynamicValue } from "mendix";
import { createElement } from "react";
import { ComboboxContainerProps } from "../../typings/ComboboxProps";
import { SingleSelection } from "../components/SingleSelection/SingleSelection";

describe("Combo box (Association)", () => {
    let defaultProps: ComboboxContainerProps;
    beforeEach(() => {
        defaultProps = {
            name: "comboBox",
            id: "comboBox1",
            optionsSourceType: "association",
            attributeAssociation: new ReferenceValueBuilder().withValue({ id: "111" } as ObjectItem).build(),
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
            emptyOptionText: dynamicValue("Select an option 111"),
            ariaRequired: true,
            clearable: true,
            filterType: "contains",
            selectionType: "checkbox"
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
        const component = render(<SingleSelection {...defaultProps} />);
        expect(component.container).toMatchSnapshot();
    });
    it("renders placeholder component in case of unavailable status", () => {
        defaultProps.attributeAssociation = new ReferenceValueBuilder().isUnavailable().build();
        const { container } = render(<SingleSelection {...defaultProps} />);
        expect(container.getElementsByClassName("widget-combobox-placeholder")).toHaveLength(1);
    });
    it("opens combobox menu with all items on trigger", async () => {
        const component = render(<SingleSelection {...defaultProps} />);
        const toggleButton = await component.findByLabelText("open menu");
        fireEvent.click(toggleButton);
        expect(component.getAllByRole("option")).toHaveLength(4);
    });
    it("closes combobox menu on trigger", async () => {
        const component = render(<SingleSelection {...defaultProps} />);
        const toggleButton = await component.findByLabelText("open menu");
        fireEvent.click(toggleButton);
        expect(component.getAllByRole("option")).toHaveLength(4);
        fireEvent.click(toggleButton);
        expect(component.queryAllByRole("option")).toHaveLength(0);
    });
    it("sets option to selected item", async () => {
        const component = render(<SingleSelection {...defaultProps} />);
        const toggleButton = await component.findByLabelText("open menu");
        fireEvent.click(toggleButton);
        const option1 = await component.findByText("222");
        fireEvent.click(option1);
        expect(defaultProps.attributeAssociation?.setValue).toBeCalled();
        expect(component.queryAllByRole("option")).toHaveLength(0);
        expect(defaultProps.attributeAssociation?.value).toEqual({ id: "222" });
    });
    it("removes selected item", async () => {
        const component = render(<SingleSelection {...defaultProps} />);
        const toggleButton = await component.findByLabelText("open menu");
        fireEvent.click(toggleButton);
        const option1 = await component.findByText("222");
        fireEvent.click(option1);
        expect(defaultProps.attributeAssociation?.setValue).toBeCalled();
        expect(component.queryAllByRole("option")).toHaveLength(0);
        expect(defaultProps.attributeAssociation?.value).toEqual({ id: "222" });
        const clearButton = await component.container.getElementsByClassName("widget-combobox-clear-button")[0];
        fireEvent.click(clearButton);
        expect(defaultProps.attributeAssociation?.value).toEqual(undefined);
    });
});
