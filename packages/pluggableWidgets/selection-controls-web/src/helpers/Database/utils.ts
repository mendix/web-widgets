import {
    DynamicValue,
    EditableValue,
    ListAttributeValue,
    ListExpressionValue,
    ListValue,
    ListWidgetValue
} from "mendix";
import {
    SelectionControlsContainerProps,
    OptionsSourceAssociationCustomContentTypeEnum,
    OptionsSourceDatabaseCaptionTypeEnum
} from "../../../typings/SelectionControlsProps";
import Big from "big.js";

type ExtractionReturnValue = {
    targetAttribute?: EditableValue<string | Big>;
    captionProvider?: ListAttributeValue<string> | ListExpressionValue<string>;
    captionType: OptionsSourceDatabaseCaptionTypeEnum;
    customContent?: ListWidgetValue;
    customContentType: OptionsSourceAssociationCustomContentTypeEnum;
    ds: ListValue;
    emptyOption?: DynamicValue<string>;
    valueSourceAttribute: ListAttributeValue<string | Big> | undefined;
};

export function extractDatabaseProps(props: SelectionControlsContainerProps): ExtractionReturnValue {
    const targetAttribute = props.databaseAttributeString;

    const ds = props.optionsSourceDatabaseDataSource;
    if (!ds) {
        throw new Error("'optionsSourceType' type is 'database' but 'optionsSourceDatabaseDataSource' is not defined.");
    }
    const captionType = props.optionsSourceDatabaseCaptionType;
    const captionAttribute = props.optionsSourceDatabaseCaptionAttribute;
    const captionExpression = props.optionsSourceDatabaseCaptionExpression;
    const customContent = props.optionsSourceDatabaseCustomContent;
    const customContentType = props.optionsSourceDatabaseCustomContentType;
    const valueSourceAttribute = props.optionsSourceDatabaseValueAttribute;

    if (targetAttribute) {
        if (
            targetAttribute.value instanceof Big &&
            valueSourceAttribute?.type !== "Integer" &&
            valueSourceAttribute?.type !== "Long" &&
            valueSourceAttribute?.type !== "Enum"
        ) {
            throw new Error(
                `Target attribute is of type Number while Value attribute is of type ${valueSourceAttribute?.type}`
            );
        }
        if (
            typeof targetAttribute.value === "string" &&
            valueSourceAttribute?.type !== "String" &&
            valueSourceAttribute?.type !== "Enum"
        ) {
            throw new Error(
                `Target attribute is of type String while Value attribute is of type ${valueSourceAttribute?.type}`
            );
        }
    }

    return {
        targetAttribute,
        captionProvider: captionType === "attribute" ? captionAttribute : captionExpression,
        captionType,
        customContent,
        customContentType,
        ds,
        valueSourceAttribute
    };
}

export function getReadonly(
    targetAttribute: EditableValue<string | Big> | undefined,
    customEditability: SelectionControlsContainerProps["customEditability"],
    customEditabilityExpression: SelectionControlsContainerProps["customEditabilityExpression"]
): boolean {
    if (targetAttribute) {
        return targetAttribute.readOnly;
    }
    if (customEditability === "never") {
        return true;
    }
    if (customEditability === "conditionally") {
        return customEditabilityExpression.value ?? true;
    }
    return false;
}
