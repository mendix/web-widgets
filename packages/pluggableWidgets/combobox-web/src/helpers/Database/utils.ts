import {
    ActionValue,
    DynamicValue,
    EditableValue,
    ListAttributeValue,
    ListExpressionValue,
    ListValue,
    ListWidgetValue
} from "mendix";
import {
    ComboboxContainerProps,
    FilterTypeEnum,
    OptionsSourceAssociationCustomContentTypeEnum
} from "../../../typings/ComboboxProps";
import Big from "big.js";

type ExtractionReturnValue = [
    EditableValue<string | Big>,
    ListValue,
    ListAttributeValue<string> | ListExpressionValue<string> | undefined,
    DynamicValue<string> | undefined,
    boolean,
    FilterTypeEnum,
    ActionValue | undefined,
    ListWidgetValue | undefined,
    OptionsSourceAssociationCustomContentTypeEnum,
    ListAttributeValue<string | Big>,
    DynamicValue<string | Big>
];

export function extractDatabaseProps(props: ComboboxContainerProps): ExtractionReturnValue {
    const attr = props.databaseAttributeString;
    const filterType = props.filterType;
    const onChangeEvent = props.onChangeEvent;

    if (!attr) {
        throw new Error("'optionsSourceType' type is 'Database' but 'databaseAttributeString' is not defined.");
    }

    const ds = props.optionsSourceDatabaseDataSource;
    if (!ds) {
        throw new Error("'optionsSourceType' type is 'database' but 'optionsSourceDatabaseDataSource' is not defined.");
    }
    const captionType = props.optionsSourceDatabaseCaptionType;
    const captionAttribute = props.optionsSourceDatabaseCaptionAttribute;
    const captionExpression = props.optionsSourceDatabaseCaptionExpression;
    const emptyOption = props.emptyOptionText;
    const emptyValue = props.optionsSourceDatabaseDefaultValue;
    const clearable = props.clearable;
    const customContent = props.optionsSourceAssociationCustomContent;
    const customContentType = props.optionsSourceAssociationCustomContentType;
    const valueAttribute = props.optionsSourceDatabaseValueAttribute;

    if (attr.value instanceof Big && valueAttribute?.type !== "Integer" && valueAttribute?.type !== "Enum") {
        throw new Error(`Atrribute is type of Integer while Value has type ${valueAttribute?.type}`);
    }
    if (typeof attr.value === "string" && valueAttribute?.type !== "String" && valueAttribute?.type !== "Enum") {
        throw new Error(`Atrribute is type of String while Value has type ${valueAttribute?.type}`);
    }

    if (!valueAttribute) {
        throw new Error("'valueExpression' is not defined");
    }

    return [
        attr,
        ds,
        captionType === "attribute" ? captionAttribute : captionExpression,
        emptyOption,
        clearable,
        filterType,
        onChangeEvent,
        customContent,
        customContentType,
        valueAttribute,
        emptyValue
    ];
}
