import Big from "big.js";
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
    LoadingTypeEnum,
    OptionsSourceAssociationCustomContentTypeEnum,
    OptionsSourceDatabaseCaptionTypeEnum
} from "../../../typings/ComboboxProps";

type ExtractionReturnValue = {
    targetAttribute?: EditableValue<string | Big>;
    captionProvider?: ListAttributeValue<string> | ListExpressionValue<string>;
    captionType: OptionsSourceDatabaseCaptionTypeEnum;
    clearable: boolean;
    customContent?: ListWidgetValue;
    customContentType: OptionsSourceAssociationCustomContentTypeEnum;
    ds: ListValue;
    emptyOption?: DynamicValue<string>;
    emptyValue?: DynamicValue<string | Big>;
    filterType: FilterTypeEnum;
    onChangeEvent?: ActionValue;
    lazyLoading: boolean;
    loadingType: LoadingTypeEnum;
    valueSourceAttribute: ListAttributeValue<string | Big> | undefined;
};

export function extractDatabaseProps(props: ComboboxContainerProps): ExtractionReturnValue {
    const targetAttribute = props.databaseAttributeString;
    const filterType = props.filterType;
    const onChangeEvent = props.onChangeEvent;

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
    const customContent = props.optionsSourceDatabaseCustomContent;
    const customContentType = props.optionsSourceDatabaseCustomContentType;
    const valueSourceAttribute = props.optionsSourceDatabaseValueAttribute;
    const lazyLoading = (props.lazyLoading && props.optionsSourceDatabaseCaptionType !== "expression") ?? false;
    const loadingType = props.loadingType;

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
        clearable,
        customContent,
        customContentType,
        ds,
        emptyOption,
        emptyValue,
        filterType,
        onChangeEvent,
        lazyLoading,
        loadingType,
        valueSourceAttribute
    };
}
