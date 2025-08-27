import { ComboboxContainerProps } from "../../../pluggableWidgets/combobox-web/typings/ComboboxProps";
import { ObjectItem } from "./mendix";
import {
    createDynamicValue,
    createEditableValue,
    createListValue,
    createListAttributeValue,
    createListExpressionValue,
    createReferenceSetValue,
    createMockObjectItem,
    createMockObjectItems
} from "./widget-tools";

// Mock object items
const mockObjectItem1: ObjectItem = createMockObjectItem("111");
const mockObjectItem2: ObjectItem = createMockObjectItem("222");
const mockObjectItem3: ObjectItem = createMockObjectItem("333");
const mockObjectItem4: ObjectItem = createMockObjectItem("444");

export const mockProps: ComboboxContainerProps = {
    name: "comboBox",
    id: "comboBox1",
    tabIndex: 0,
    source: "context",
    optionsSourceType: "association",

    // Attribute values
    attributeEnumeration: createEditableValue<string>("enumValue"),
    attributeBoolean: createEditableValue<boolean>(false),
    attributeAssociation: createReferenceSetValue([mockObjectItem3]),
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
    optionsSourceAssociationCaptionExpression: createListExpressionValue<string>("$currentObject/CountryName"),
    optionsSourceAssociationCustomContentType: "no",
    optionsSourceAssociationCustomContent: undefined,

    // Database source (optional)
    optionsSourceDatabaseDataSource: undefined,
    optionsSourceDatabaseItemSelection: undefined,
    optionsSourceDatabaseCaptionType: "attribute",
    optionsSourceDatabaseCaptionAttribute: undefined,
    optionsSourceDatabaseCaptionExpression: undefined,
    optionsSourceDatabaseValueAttribute: undefined,
    optionsSourceDatabaseCustomContentType: "no",
    optionsSourceDatabaseCustomContent: undefined,

    // Static source
    optionsSourceStaticDataSource: [
        {
            staticDataSourceValue: createDynamicValue("value1"),
            staticDataSourceCustomContent: undefined,
            staticDataSourceCaption: createDynamicValue("Caption 1")
        },
        {
            staticDataSourceValue: createDynamicValue("value2"),
            staticDataSourceCustomContent: undefined,
            staticDataSourceCaption: createDynamicValue("Caption 2")
        }
    ],
    staticDataSourceCustomContentType: "no",

    // UI Configuration
    emptyOptionText: createDynamicValue("Select an option"),
    noOptionsText: createDynamicValue("No options available"),
    clearable: true,
    selectedItemsStyle: "text",
    selectionMethod: "checkbox",
    selectAllButton: false,
    selectAllButtonCaption: createDynamicValue("Select All"),
    showFooter: false,
    menuFooterContent: undefined,

    // Editability
    customEditability: "default",
    customEditabilityExpression: createDynamicValue(false),
    readOnlyStyle: "bordered",

    // Events (optional)
    onChangeEvent: undefined,
    onEnterEvent: undefined,
    onLeaveEvent: undefined,
    onChangeFilterInputEvent: undefined,

    // Accessibility
    ariaRequired: createDynamicValue(false),
    ariaLabel: createDynamicValue("Combobox"),
    clearButtonAriaLabel: createDynamicValue("Clear selection"),
    removeValueAriaLabel: createDynamicValue("Remove value"),
    a11ySelectedValue: createDynamicValue("Selected value:"),
    a11yOptionsAvailable: createDynamicValue("Options available:"),
    a11yInstructions: createDynamicValue("Use arrow keys to navigate options"),

    // Filtering and loading
    filterType: "contains",
    filterInputDebounceInterval: 300,
    lazyLoading: false,
    loadingType: "spinner",
    selectedItemsSorting: "none"
};
