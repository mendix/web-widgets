import {
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
import Big from "big.js";

type ExtractionReturnValue = {
    attr?: EditableValue<string | Big>;
    captionProvider?: ListAttributeValue<string> | ListExpressionValue<string>;
    captionType: OptionsSourceDatabaseCaptionTypeEnum;
    clearable: boolean;
    customContent?: ListWidgetValue;
    customContentType: OptionsSourceAssociationCustomContentTypeEnum;
    ds: ListValue;
    emptyOption?: DynamicValue<string>;
    emptyValue?: DynamicValue<string | Big>;
    filterType: FilterTypeEnum;
    lazyLoading: boolean;
    loadingType: LoadingTypeEnum;
    valueAttribute: ListAttributeValue<string | Big> | undefined;
};

export function extractDatabaseProps(props: ComboboxContainerProps): ExtractionReturnValue {
    const attr = props.databaseAttributeString;
    const filterType = props.filterType;

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
    const lazyLoading = (props.lazyLoading && props.optionsSourceDatabaseCaptionType !== "expression") ?? false;
    const loadingType = props.loadingType;

    if (attr) {
        if (
            attr.value instanceof Big &&
            valueAttribute?.type !== "Integer" &&
            valueAttribute?.type !== "Long" &&
            valueAttribute?.type !== "Enum"
        ) {
            throw new Error(`Attribute is type of Number while Value has type ${valueAttribute?.type}`);
        }
        if (typeof attr.value === "string" && valueAttribute?.type !== "String" && valueAttribute?.type !== "Enum") {
            throw new Error(`Attribute is type of String while Value has type ${valueAttribute?.type}`);
        }
    }

    if (!valueAttribute && props.optionsSourceDatabaseItemSelection?.type !== "Multi") {
        throw new Error("'valueAttribute' is not defined");
    }

    return {
        attr,
        captionProvider: captionType === "attribute" ? captionAttribute : captionExpression,
        captionType,
        clearable,
        customContent,
        customContentType,
        ds,
        emptyOption,
        emptyValue,
        filterType,
        lazyLoading,
        loadingType,
        valueAttribute
    };
}
