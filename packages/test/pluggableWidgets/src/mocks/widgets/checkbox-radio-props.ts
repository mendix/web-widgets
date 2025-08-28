import { CheckboxRadioSelectionContainerProps } from "../../../../pluggableWidgets/checkbox-radio-selection-web/typings/CheckboxRadioSelectionProps";
import { ObjectItem } from "../mendix";
import {
    createDynamicValue,
    createEditableValue,
    createListValue,
    createListAttributeValue,
    createListExpressionValue,
    createReferenceValue,
    createReferenceSetValue,
    createMockObjectItem,
    createMockObjectItems
} from "../widget-tools";

// Mock object items for checkbox/radio options
const mockObjectItem1: ObjectItem = createMockObjectItem("option1");
const mockObjectItem2: ObjectItem = createMockObjectItem("option2");
const mockObjectItem3: ObjectItem = createMockObjectItem("option3");
const mockObjectItem4: ObjectItem = createMockObjectItem("option4");

export function createMockCheckboxProps(): CheckboxRadioSelectionContainerProps {
    return {
        name: "checkboxRadioSelection",
        id: "checkboxRadioSelection1",
        tabIndex: 0,
        source: "context",
        optionsSourceType: "association",

        // Attribute values
        attributeEnumeration: createEditableValue<string>("enumValue"),
        attributeBoolean: createEditableValue<boolean>(false),
        attributeAssociation: createReferenceSetValue([mockObjectItem1, mockObjectItem3]),
        staticAttribute: createEditableValue<string>("staticValue"),
        databaseAttributeString: createEditableValue<string>("databaseValue"),

        // Association source
        optionsSourceAssociationDataSource: createListValue([
            mockObjectItem1,
            mockObjectItem2,
            mockObjectItem3,
            mockObjectItem4
        ]),
        optionsSourceAssociationCaptionType: "expression",
        optionsSourceAssociationCaptionAttribute: createListAttributeValue<string>(),
        optionsSourceAssociationCaptionExpression: createListExpressionValue<string>("$currentObject/OptionName"),
        optionsSourceCustomContentType: "no",
        optionsSourceAssociationCustomContent: undefined,

        // Database source (optional)
        optionsSourceDatabaseDataSource: undefined,
        optionsSourceDatabaseItemSelection: undefined,
        optionsSourceDatabaseCaptionType: "attribute",
        optionsSourceDatabaseCaptionAttribute: undefined,
        optionsSourceDatabaseCaptionExpression: undefined,
        optionsSourceDatabaseValueAttribute: undefined,
        optionsSourceDatabaseCustomContent: undefined,

        // Static source
        optionsSourceStaticDataSource: [
            {
                staticDataSourceValue: createDynamicValue("option1"),
                staticDataSourceCustomContent: undefined,
                staticDataSourceCaption: createDynamicValue("Option 1")
            },
            {
                staticDataSourceValue: createDynamicValue("option2"),
                staticDataSourceCustomContent: undefined,
                staticDataSourceCaption: createDynamicValue("Option 2")
            },
            {
                staticDataSourceValue: createDynamicValue("option3"),
                staticDataSourceCustomContent: undefined,
                staticDataSourceCaption: createDynamicValue("Option 3")
            }
        ],

        // UI Configuration
        noOptionsText: createDynamicValue("No options available"),
        controlType: "checkbox", // Can be "checkbox" or "radio"

        // Editability
        customEditability: "default",
        customEditabilityExpression: createDynamicValue(false),
        readOnlyStyle: "bordered",

        // Events (optional)
        onChangeEvent: undefined,

        // Accessibility
        ariaRequired: createDynamicValue(false),
        groupName: createDynamicValue("checkboxGroup")
    };
}

// Keep the old export for backward compatibility (deprecated)
export const mockCheckboxProps = createMockCheckboxProps();
