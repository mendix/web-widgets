import {
    ActionValue,
    DynamicValue,
    ListAttributeValue,
    ListExpressionValue,
    ListValue,
    ListWidgetValue,
    ReferenceSetValue,
    ReferenceValue,
    ValueStatus
} from "mendix";
import {
    CheckboxRadioSelectionContainerProps,
    OptionsSourceCustomContentTypeEnum
} from "../../../typings/CheckboxRadioSelectionProps";

export function extractAssociationProps(
    props: CheckboxRadioSelectionContainerProps
): [
    ReferenceValue | ReferenceSetValue,
    ListValue,
    ListAttributeValue<string> | ListExpressionValue<string>,
    DynamicValue<string>,
    boolean,
    ActionValue | undefined,
    ListWidgetValue | undefined,
    OptionsSourceCustomContentTypeEnum
] {
    const attr = props.attributeAssociation;
    const ds = props.optionsSourceAssociationDataSource!;

    // Determine caption provider based on caption type
    const captionProvider =
        props.optionsSourceAssociationCaptionType === "attribute"
            ? props.optionsSourceAssociationCaptionAttribute!
            : props.optionsSourceAssociationCaptionExpression!;

    // For simplicity, we'll create a basic empty option
    const emptyOption: DynamicValue<string> = {
        status: ValueStatus.Available,
        value: ""
    };

    // Checkbox Radio Selection controls don't need clearable like combobox does
    const clearable = false;

    const onChangeEvent = props.onChangeEvent;
    const customContent = props.optionsSourceAssociationCustomContent;
    const customContentType = props.optionsSourceCustomContentType;

    return [attr, ds, captionProvider, emptyOption, clearable, onChangeEvent, customContent, customContentType];
}
