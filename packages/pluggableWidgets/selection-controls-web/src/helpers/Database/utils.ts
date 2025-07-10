import {
    DynamicValue,
    EditableValue,
    ListAttributeValue,
    ListExpressionValue,
    ListValue,
    ListWidgetValue,
    ValueStatus
} from "mendix";
import { Big } from "big.js";
import {
    SelectionControlsContainerProps,
    CustomEditabilityEnum,
    OptionsSourceDatabaseCustomContentTypeEnum
} from "../../../typings/SelectionControlsProps";

export function extractDatabaseProps(props: SelectionControlsContainerProps): {
    targetAttribute: EditableValue<string | Big> | undefined;
    captionProvider: ListAttributeValue<string> | ListExpressionValue<string>;
    clearable: boolean;
    customContent: ListWidgetValue | undefined;
    customContentType: OptionsSourceDatabaseCustomContentTypeEnum;
    ds: ListValue;
    emptyOption: DynamicValue<string>;
    valueSourceAttribute: ListAttributeValue<string | Big> | undefined;
} {
    const targetAttribute = props.databaseAttributeString;
    const ds = props.optionsSourceDatabaseDataSource!;

    // Determine caption provider based on caption type
    const captionProvider =
        props.optionsSourceDatabaseCaptionType === "attribute"
            ? props.optionsSourceDatabaseCaptionAttribute!
            : props.optionsSourceDatabaseCaptionExpression!;

    // For simplicity, we'll create a basic empty option
    const emptyOption: DynamicValue<string> = {
        status: ValueStatus.Available,
        value: ""
    };

    // Selection controls don't need clearable like combobox does
    const clearable = false;

    const customContent = props.optionsSourceDatabaseCustomContent;
    const customContentType = props.optionsSourceDatabaseCustomContentType;
    const valueSourceAttribute = props.optionsSourceDatabaseValueAttribute;

    return {
        targetAttribute,
        captionProvider,
        clearable,
        customContent,
        customContentType,
        ds,
        emptyOption,
        valueSourceAttribute
    };
}

export function getReadonly(
    attribute: EditableValue<string | Big> | undefined,
    customEditability: CustomEditabilityEnum,
    customEditabilityExpression: DynamicValue<boolean>
): boolean {
    if (customEditability === "never") {
        return true;
    }
    if (customEditability === "conditionally" && customEditabilityExpression.value === false) {
        return true;
    }
    return attribute?.readOnly ?? false;
}
