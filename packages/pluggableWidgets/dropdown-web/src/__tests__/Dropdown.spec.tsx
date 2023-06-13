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
import { DropdownContainerProps } from "../../typings/DropdownProps";
import { Dropdown } from "../components/Dropdown";

describe("Drop-down (Association)", () => {
    let defaultProps: DropdownContainerProps;
    beforeEach(() => {
        defaultProps = {
            name: "drop_down",
            id: "drop_down1",
            optionsSourceType: "association",
            attributeAssociation: new ReferenceValueBuilder().withValue({ id: "DefaultValue" as GUID }).build(),
            attributeEnumerationOrBoolean: new EditableValueBuilder<string>().build(),
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
    it("renders dropdown widget", () => {
        const component = render(<Dropdown {...defaultProps} />);
        expect(component.container).toMatchSnapshot();
    });
    it("renders placeholder component in case of unavailable status", () => {
        defaultProps.attributeAssociation = new ReferenceValueBuilder().isUnavailable().build();
        const { container } = render(<Dropdown {...defaultProps} />);
        expect(container.getElementsByClassName("widget-dropdown-placeholder")).toHaveLength(1);
    });
    it("opens dropdown menu with all items on trigger", async () => {
        const component = render(<Dropdown {...defaultProps} />);
        const toggleButton = await component.findByLabelText("open menu");
        fireEvent.click(toggleButton);
        expect(component.getAllByRole("option")).toHaveLength(4);
    });
    it("closes dropdown menu on trigger", async () => {
        const component = render(<Dropdown {...defaultProps} />);
        const toggleButton = await component.findByLabelText("open menu");
        fireEvent.click(toggleButton);
        expect(component.getAllByRole("option")).toHaveLength(4);
        fireEvent.click(toggleButton);
        expect(component.queryAllByRole("option")).toHaveLength(0);
    });
    it("sets option to selected item", async () => {
        const component = render(<Dropdown {...defaultProps} />);
        const toggleButton = await component.findByLabelText("open menu");
        fireEvent.click(toggleButton);
        const option1 = await component.findByText("(Netherlands)");
        fireEvent.click(option1);
        expect(defaultProps.attributeAssociation?.setValue).toBeCalled();
        expect(component.queryAllByRole("option")).toHaveLength(0);
        expect(defaultProps.attributeAssociation?.value).toEqual({ id: "Netherlands" });
    });
    it("removes selected item", async () => {
        const component = render(<Dropdown {...defaultProps} />);
        const toggleButton = await component.findByLabelText("open menu");
        fireEvent.click(toggleButton);
        const option1 = await component.findByText("(Netherlands)");
        fireEvent.click(option1);
        expect(defaultProps.attributeAssociation?.setValue).toBeCalled();
        expect(component.queryAllByRole("option")).toHaveLength(0);
        expect(defaultProps.attributeAssociation?.value).toEqual({ id: "Netherlands" });
        const clearButton = await component.container.getElementsByClassName("widget-dropdown-clear-button")[0];
        fireEvent.click(clearButton);
        expect(defaultProps.attributeAssociation?.value).toEqual(undefined);
    });
});
