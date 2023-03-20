import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { createElement } from "react";
import { DropdownContainerProps } from "../../typings/DropdownProps";
import { DropdownMenu, DropdownMenuProps } from "../components/DropdownMenu";
import { useGetSelector } from "../hooks/useGetSelector";
import { ObjectItem, GUID } from "mendix";
import {
    ListAttributeValueBuilder,
    ReferenceValueBuilder,
    EditableValueBuilder,
    ListValueBuilder,
    dynamicValue,
    buildListExpression
} from "@mendix/pluggable-test-utils";

describe("Drop-down", () => {
    const containerProps: DropdownContainerProps = {
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
        typeahead: "contains"
    };

    const menuProps: DropdownMenuProps = {
        dropdownSize: {
            height: 10,
            width: 10,
            top: 10,
            bottom: 0,
            x: 10,
            y: 10,
            left: 10,
            right: 10,
            toJSON: jest.fn()
        },
        isOpen: true,
        selector: useGetSelector(containerProps),
        selectedItem: "",
        highlightedIndex: 0
    };

    beforeEach(() => {
        menuProps.selector.updateProps(containerProps);
    });
    it("renders dropdown widget", () => {
        expect(render(<DropdownMenu {...menuProps} />)).toMatchSnapshot();
    });
});
