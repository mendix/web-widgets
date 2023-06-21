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
import { GUID, ObjectItem } from "mendix";
import { createElement } from "react";
import { ComboboxContainerProps } from "../../typings/ComboboxProps";
import { Combobox } from "../components/Combobox";

describe("Combo box (Association)", () => {
    let defaultProps: ComboboxContainerProps;
    beforeEach(() => {
        defaultProps = {
            name: "comboBox",
            id: "comboBox1",
            optionsSourceType: "association",
            attributeAssociation: new ReferenceValueBuilder().withValue({ id: "DefaultValue" as GUID }).build(),
            attributeEnumeration: new EditableValueBuilder<string>().build(),
            attributeBoolean: new EditableValueBuilder<boolean>().build(),
            optionsSourceAssociationDataSource: ListValueBuilder().withItems([
                { id: "Netherlands" },
                { id: "France" },
                { id: "Germany" },
                { id: "Turkey" }
            ] as ObjectItem[]),
            optionsSourceAssociationCaptionAttribute: new ListAttributeValueBuilder<string>().build(),
            optionsSourceAssociationCaptionExpression: buildListExpression(""),
            emptyOptionText: dynamicValue("Select an option 111"),
            optionsSourceAssociationCaptionType: "expression",
            ariaRequired: true,
            clearable: true,
            filterType: "contains"
        };
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
    it("opens combobox menu with all items on trigger", async () => {
        const component = render(<Combobox {...defaultProps} />);
        const toggleButton = await component.findByLabelText("open menu");
        fireEvent.click(toggleButton);
        expect(component.getAllByRole("option")).toHaveLength(4);
    });
    it("closes combobox menu on trigger", async () => {
        const component = render(<Combobox {...defaultProps} />);
        const toggleButton = await component.findByLabelText("open menu");
        fireEvent.click(toggleButton);
        expect(component.getAllByRole("option")).toHaveLength(4);
        fireEvent.click(toggleButton);
        expect(component.queryAllByRole("option")).toHaveLength(0);
    });
    it("sets option to selected item", async () => {
        const component = render(<Combobox {...defaultProps} />);
        const toggleButton = await component.findByLabelText("open menu");
        fireEvent.click(toggleButton);
        const option1 = await component.findByText("(Netherlands)");
        fireEvent.click(option1);
        expect(defaultProps.attributeAssociation?.setValue).toBeCalled();
        expect(component.queryAllByRole("option")).toHaveLength(0);
        expect(defaultProps.attributeAssociation?.value).toEqual({ id: "Netherlands" });
    });
    it("removes selected item", async () => {
        const component = render(<Combobox {...defaultProps} />);
        const toggleButton = await component.findByLabelText("open menu");
        fireEvent.click(toggleButton);
        const option1 = await component.findByText("(Netherlands)");
        fireEvent.click(option1);
        expect(defaultProps.attributeAssociation?.setValue).toBeCalled();
        expect(component.queryAllByRole("option")).toHaveLength(0);
        expect(defaultProps.attributeAssociation?.value).toEqual({ id: "Netherlands" });
        const clearButton = await component.container.getElementsByClassName("widget-combobox-clear-button")[0];
        fireEvent.click(clearButton);
        expect(defaultProps.attributeAssociation?.value).toEqual(undefined);
    });
});
